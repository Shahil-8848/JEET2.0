-- 1. Ensure 'screenshots' bucket exists
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- 2. Ensure policies exist (drop and recreate to be safe)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'screenshots' );

create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'screenshots' );

-- 3. Ensure matches table has screenshot_url
alter table public.matches 
add column if not exists screenshot_url text;

-- 4. Update submit_match_result to sync to matches table
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

  -- Update Match Screenshot (for Admin ease)
  -- This will overwrite with the latest upload from ANY participant.
  update public.matches
  set screenshot_url = p_screenshot_url,
      status = 'COMPLETED'
  where id = p_match_id;

  return json_build_object('success', true);
end;
$$;
