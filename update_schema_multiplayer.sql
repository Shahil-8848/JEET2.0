-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- 1. Create Participants Table
create table if not exists public.match_participants (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) not null,
  user_id uuid references public.users(id) not null,
  is_ready boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(match_id, user_id)
);

-- Enable RLS
alter table public.match_participants enable row level security;

-- Policies for Participants
drop policy if exists "Everyone can view participants" on public.match_participants;
create policy "Everyone can view participants"
  on public.match_participants for select
  using ( true );

drop policy if exists "Users can update their own status" on public.match_participants;
create policy "Users can update their own status"
  on public.match_participants for update
  using ( auth.uid() = user_id );

-- 2. Update Matches Table to support Max Players
alter table public.matches 
add column if not exists max_players int default 2,
add column if not exists current_players int default 1; -- Host starts in

-- 3. Update create_match RPC
-- Drop old function to avoid conflicts if signature changes
drop function if exists public.create_match(text, numeric, text, text, numeric);

create or replace function public.create_match(
  p_game_type text,
  p_entry_fee numeric,
  p_team_size text,
  p_room_code text,
  p_prize_amount numeric
)
returns json
language plpgsql
security definer
as $$
declare
  v_match_id uuid;
  v_user_balance numeric;
  v_max_players int;
begin
  -- Check Balance
  select balance into v_user_balance from public.users where id = auth.uid();
  
  if v_user_balance < p_entry_fee then
    return json_build_object('success', false, 'error', 'Insufficient balance');
  end if;

  -- Determine Max Players based on Team Size (Simple logic)
  v_max_players := case 
    when p_team_size = '1v1' then 2
    when p_team_size = '2v2' then 4
    when p_team_size = 'Squad' then 4 -- Assuming 4 for now, could be 100 for heavy games
    else 2
  end;

  -- Deduct Balance
  update public.users set balance = balance - p_entry_fee where id = auth.uid();

  -- Create Match
  insert into public.matches (
    game_type, 
    host_id, 
    entry_fee, 
    prize_amount, 
    team_size, 
    room_code,
    max_players,
    current_players,
    status
  )
  values (
    p_game_type, 
    auth.uid(), 
    p_entry_fee, 
    p_prize_amount, 
    p_team_size, 
    p_room_code,
    v_max_players,
    1,
    'PENDING'
  )
  returning id into v_match_id;

  -- Add Host to Participants
  insert into public.match_participants (match_id, user_id, is_ready)
  values (v_match_id, auth.uid(), false);

  -- Record Transaction
  insert into public.transactions (user_id, type, amount, description, match_id)
  values (auth.uid(), 'ENTRY_FEE', p_entry_fee, 'Entry fee for match ' || p_game_type, v_match_id);

  return json_build_object('success', true, 'match_id', v_match_id);
end;
$$;

-- 4. Update join_match RPC
-- Drop old function strictly (it might have had different parameter names)
drop function if exists public.join_match(uuid);

create or replace function public.join_match(p_match_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
  v_user_balance numeric;
begin
  -- Get Match Info
  select * into v_match from public.matches where id = p_match_id;

  if not found then
    return json_build_object('success', false, 'error', 'Match not found');
  end if;

  if v_match.status != 'PENDING' then
    return json_build_object('success', false, 'error', 'Match is not open for joining');
  end if;

  if v_match.current_players >= v_match.max_players then
    return json_build_object('success', false, 'error', 'Match is full');
  end if;

  -- Check if already joined
  if exists (select 1 from public.match_participants where match_id = p_match_id and user_id = auth.uid()) then
    return json_build_object('success', false, 'error', 'Already joined');
  end if;

  -- Check Balance
  select balance into v_user_balance from public.users where id = auth.uid();
  
  if v_user_balance < v_match.entry_fee then
    return json_build_object('success', false, 'error', 'Insufficient balance');
  end if;

  -- Deduct Balance
  update public.users set balance = balance - v_match.entry_fee where id = auth.uid();

  -- Add to Participants
  insert into public.match_participants (match_id, user_id, is_ready)
  values (p_match_id, auth.uid(), false);

  -- Update Match (Opponent ID is deprecated for multiplayer but we can keep it for 1v1 legacy or just ignore)
  -- If it's the second player, we might still update opponent_id for backward compat if needed, but let's stick to participants.
  update public.matches 
  set current_players = current_players + 1,
      opponent_id = case when opponent_id is null then auth.uid() else opponent_id end -- Legacy support
  where id = p_match_id;

  -- Record Transaction
  insert into public.transactions (user_id, type, amount, description, match_id)
  values (auth.uid(), 'ENTRY_FEE', v_match.entry_fee, 'Entry fee for match ' || v_match.game_type, p_match_id);

  return json_build_object('success', true);
end;
$$;

-- 5. Helper RPC to Set Ready
create or replace function public.set_participant_ready(p_match_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_all_ready boolean;
  v_current_count int;
  v_max_players int;
begin
  -- Update Participant
  update public.match_participants 
  set is_ready = true 
  where match_id = p_match_id and user_id = auth.uid();

  -- Check if match should go LIVE
  select count(*), max_players into v_current_count, v_max_players 
  from public.matches 
  where id = p_match_id;

  -- Check if ALL participants are ready
  -- (We need to join participants to ensure we are counting just the ones in this match)
  select bool_and(is_ready) into v_all_ready 
  from public.match_participants 
  where match_id = p_match_id;

  -- If full and all ready, set LIVE
  if v_current_count = v_max_players and v_all_ready then
    update public.matches set status = 'LIVE' where id = p_match_id;
  end if;

  return json_build_object('success', true);
end;
$$;
