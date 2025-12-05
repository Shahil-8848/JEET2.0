-- Fix for missing match_id in transactions table
alter table public.transactions 
add column if not exists match_id uuid references public.matches(id);

-- Reload the schema cache (Supabase usually does this automatically on DDL, but good to know)
notify pgrst, 'reload config';
