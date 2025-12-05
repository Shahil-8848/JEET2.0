-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  balance numeric default 100, -- Welcome bonus
  total_matches int default 0,
  wins int default 0,
  losses int default 0,
  total_earnings numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for Users
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, balance)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 100);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- GAME IDS TABLE
create table public.game_ids (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  game_name text not null,
  game_username text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, game_name)
);

alter table public.game_ids enable row level security;

create policy "Users can view own game ids."
  on public.game_ids for select
  using ( auth.uid() = user_id );

create policy "Users can insert own game ids."
  on public.game_ids for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own game ids."
  on public.game_ids for update
  using ( auth.uid() = user_id );

-- MATCHES TABLE
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  room_code text,
  game_type text not null,
  host_id uuid references public.users(id) not null,
  opponent_id uuid references public.users(id),
  entry_fee numeric not null,
  prize_amount numeric not null,
  team_size text default '1v1',
  status text default 'PENDING', -- PENDING, LIVE, COMPLETED, VERIFIED
  host_ready boolean default false,
  opponent_ready boolean default false,
  winner_id uuid references public.users(id),
  screenshot_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.matches enable row level security;

create policy "Matches are viewable by everyone."
  on public.matches for select
  using ( true );

create policy "Users can create matches."
  on public.matches for insert
  with check ( auth.uid() = host_id );

create policy "Users can update matches they are part of."
  on public.matches for update
  using ( auth.uid() = host_id or auth.uid() = opponent_id );

create policy "Users can join pending matches"
  on public.matches for update
  using ( status = 'PENDING' and opponent_id is null );

-- TRANSACTIONS TABLE
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  type text not null, -- DEPOSIT, WITHDRAWAL, ENTRY_FEE, PRIZE, TRANSFER
  amount numeric not null,
  description text,
  match_id uuid references public.matches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions."
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own transactions."
  on public.transactions for insert
  with check ( auth.uid() = user_id );

-- STORAGE BUCKET FOR SCREENSHOTS
insert into storage.buckets (id, name)
values ('screenshots', 'screenshots');

create policy "Anyone can upload screenshots"
  on storage.objects for insert
  with check ( bucket_id = 'screenshots' );

create policy "Anyone can view screenshots"
  on storage.objects for select
  using ( bucket_id = 'screenshots' );
