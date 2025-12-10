-- 1. Add screenshot_url to match_participants
alter table public.match_participants 
add column if not exists screenshot_url text;

-- 2. Update submit_match_result RPC
create or replace function public.submit_match_result(p_match_id uuid, p_screenshot_url text)
returns json
language plpgsql
security definer
as $$
declare
  v_is_participant boolean;
begin
  -- Check if user is participant
  select exists(
    select 1 from public.match_participants 
    where match_id = p_match_id and user_id = auth.uid()
  ) into v_is_participant;

  if not v_is_participant then
    return json_build_object('success', false, 'error', 'Not a participant');
  end if;

  -- Update Participant Screenshot
  update public.match_participants
  set screenshot_url = p_screenshot_url
  where match_id = p_match_id and user_id = auth.uid();

  -- Update Match Status to COMPLETED (flagging for Admin)
  -- We allow status update even if already COMPLETED (to allow second player to upload late)
  update public.matches
  set status = 'COMPLETED'
  where id = p_match_id and status != 'VERIFIED'; 

  return json_build_object('success', true);
end;
$$;
