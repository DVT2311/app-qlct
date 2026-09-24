create table public.goals (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id),
  name text not null,
  target_amount bigint not null check (target_amount > 0),
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.goals enable row level security;

create trigger set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create policy "goals_select"
  on public.goals for select
  to authenticated
  using (public.is_space_member(space_id));

create policy "goals_insert"
  on public.goals for insert
  to authenticated
  with check (public.is_space_member(space_id));

create policy "goals_update"
  on public.goals for update
  to authenticated
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

create table public.goal_links (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  asset_id uuid references public.assets (id),
  wallet_id uuid references public.wallets (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint goal_links_asset_xor_wallet check ((asset_id is null) <> (wallet_id is null))
);

alter table public.goal_links enable row level security;

create trigger set_updated_at
  before update on public.goal_links
  for each row execute function public.set_updated_at();

create policy "goal_links_select"
  on public.goal_links for select
  to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_links.goal_id));

create policy "goal_links_insert"
  on public.goal_links for insert
  to authenticated
  with check (exists (select 1 from public.goals g where g.id = goal_links.goal_id));

create policy "goal_links_delete"
  on public.goal_links for delete
  to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_links.goal_id));

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  amount bigint not null check (amount > 0),
  transaction_id uuid references public.transactions (id),
  occurred_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.goal_contributions enable row level security;

create trigger set_updated_at
  before update on public.goal_contributions
  for each row execute function public.set_updated_at();

create policy "goal_contributions_select"
  on public.goal_contributions for select
  to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_contributions.goal_id));

create policy "goal_contributions_insert"
  on public.goal_contributions for insert
  to authenticated
  with check (
    exists (select 1 from public.goals g where g.id = goal_contributions.goal_id)
    and user_id = auth.uid()
  );
