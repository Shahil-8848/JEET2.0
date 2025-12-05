-- 1. Fix missing match_id column (if not already added)
alter table public.transactions 
add column if not exists match_id uuid references public.matches(id);

-- 2. Fix RLS Policy for Transactions (Allow Insert)
-- First drop if exists to avoid errors on re-run
drop policy if exists "Users can insert own transactions" on public.transactions;

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

-- 3. Reload Schema Cache to fix "Could not find column" errors
notify pgrst, 'reload config';
