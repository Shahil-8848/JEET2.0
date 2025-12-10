-- Fix for set_participant_ready RPC
create or replace function public.set_participant_ready(p_match_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_max_players int;
  v_joined_count int;
  v_ready_count int;
begin
  -- Update Participant Status
  update public.match_participants 
  set is_ready = true 
  where match_id = p_match_id and user_id = auth.uid();

  -- Get Match Max Players
  select max_players into v_max_players 
  from public.matches 
  where id = p_match_id;

  -- Get Participant Counts
  select count(*) into v_joined_count 
  from public.match_participants 
  where match_id = p_match_id;

  select count(*) into v_ready_count 
  from public.match_participants 
  where match_id = p_match_id and is_ready = true;

  -- Check Condition: Room Full AND All Ready
  -- (v_ready_count should equal v_joined_count, and v_joined_count should equal max_players)
  if v_joined_count >= v_max_players and v_ready_count >= v_joined_count then
    update public.matches set status = 'LIVE' where id = p_match_id;
  end if;

  return json_build_object('success', true);
end;
$$;
