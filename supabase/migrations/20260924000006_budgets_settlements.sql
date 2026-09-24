create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles (id),
  space_id uuid references public.spaces (id),
  category_id uuid references public.categories (id),
  month date not null,
  amount bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint budgets_owner_xor_space check ((owner_user_id is null) <> (space_id is null))
);

alter table public.budgets enable row level security;

create trigger set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

create policy "budgets_select_owner_or_space"
  on public.budgets for select
  to authenticated
  using (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)));

create policy "budgets_insert_owner_or_space"
  on public.budgets for insert
  to authenticated
  with check (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)));

create policy "budgets_update_owner_or_space"
  on public.budgets for update
  to authenticated
  using (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)))
  with check (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)));

-- Bản ghi lịch sử chốt sổ — bất biến sau khi tạo, không có update/delete.
create table public.settlement_periods (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id),
  period_end date not null,
  balance_bps_json jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.settlement_periods enable row level security;

create policy "settlement_periods_select"
  on public.settlement_periods for select
  to authenticated
  using (public.is_space_member(space_id));

create policy "settlement_periods_insert"
  on public.settlement_periods for insert
  to authenticated
  with check (public.is_space_member(space_id));
