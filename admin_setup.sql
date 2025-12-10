-- Admin Setup Script
-- Run this in your Supabase SQL Editor

-- 1. RPC to Update User Balance (Admin Only)
create or replace function public.admin_update_balance(
  p_user_id uuid,
  p_amount numeric,
  p_description text
)
returns json
language plpgsql
security definer
as $$
declare
  v_new_balance numeric;
begin
  -- Check if user exists
  if not exists (select 1 from public.users where id = p_user_id) then
    return json_build_object('success', false, 'error', 'User not found');
  end if;

  -- Update balance
  update public.users
  set balance = balance + p_amount
  where id = p_user_id
  returning balance into v_new_balance;

  -- Record transaction
  insert into public.transactions (user_id, type, amount, description)
  values (
    p_user_id, 
    case when p_amount >= 0 then 'ADMIN_DEPOSIT' else 'ADMIN_DEDUCTION' end,
    p_amount, 
    p_description
  );

  return json_build_object('success', true, 'new_balance', v_new_balance);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- 2. Verify Match Result (Ensure this exists if not already run from security_hardening.sql)
create or replace function public.verify_match_result(p_match_id uuid, p_winner_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
  v_loser_id uuid;
begin
  select * into v_match from public.matches where id = p_match_id;

  if not found then
    return json_build_object('success', false, 'error', 'Match not found');
  end if;

  if v_match.status = 'VERIFIED' then
    return json_build_object('success', false, 'error', 'Match already verified');
  end if;

  -- Determine loser
  if v_match.host_id = p_winner_id then
    v_loser_id := v_match.opponent_id;
  else
    v_loser_id := v_match.host_id;
  end if;

  -- Update Match
  update public.matches
  set status = 'VERIFIED', winner_id = p_winner_id
  where id = p_match_id;

  -- Credit Prize
  update public.users
  set 
    balance = balance + v_match.prize_amount,
    total_earnings = total_earnings + v_match.prize_amount,
    wins = wins + 1,
    total_matches = total_matches + 1
  where id = p_winner_id;

  -- Update Loser Stats
  if v_loser_id is not null then
    update public.users
    set 
      losses = losses + 1,
      total_matches = total_matches + 1
    where id = v_loser_id;
  end if;

  -- Transaction
  insert into public.transactions (user_id, type, amount, description, match_id)
  values (p_winner_id, 'PRIZE_WIN', v_match.prize_amount, 'Prize for winning ' || v_match.game_type || ' match', p_match_id);

  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
