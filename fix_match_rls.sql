-- Fix RLS to allow users to join matches (update opponent_id)
-- Previous policy only allowed host or existing opponent to update.
-- We need to allow anyone to update IF the match is pending and has no opponent.

create policy "Users can join pending matches"
  on public.matches for update
  using ( status = 'PENDING' and opponent_id is null );

-- Reload schema cache
notify pgrst, 'reload config';
