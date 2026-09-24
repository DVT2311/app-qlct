create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles (id),
  space_id uuid references public.spaces (id),
  name text not null,
  kind text not null check (kind in ('cash', 'bank', 'credit_card', 'ewallet', 'shared_fund')),
  currency text not null default 'VND',
  opening_balance bigint not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint wallets_owner_xor_space check ((owner_user_id is null) <> (space_id is null))
);

alter table public.wallets enable row level security;

create trigger set_updated_at
  before update on public.wallets
  for each row execute function public.set_updated_at();

create index wallets_space_id_idx on public.wallets (space_id) where space_id is not null;

-- Riêng (owner_user_id): chỉ chủ ví đọc/ghi. Chung (space_id): mọi thành viên
-- đang hoạt động đọc/ghi (SPEC.md mục 5). Việc hiển thị TÊN một ví riêng cho
-- người kia khi ví đó trả một khoản chi chung (nhưng không lộ số dư) nằm ở
-- RPC get_wallet_display_name (migration transactions), không nới lỏng ở đây.
create policy "wallets_select_owner_or_space"
  on public.wallets for select
  to authenticated
  using (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)));

create policy "wallets_insert_owner_or_space"
  on public.wallets for insert
  to authenticated
  with check (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)));

create policy "wallets_update_owner_or_space"
  on public.wallets for update
  to authenticated
  using (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)))
  with check (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)));

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles (id),
  space_id uuid references public.spaces (id),
  is_system boolean not null default false,
  name text not null,
  kind text not null check (kind in ('expense', 'income')),
  icon text,
  color text,
  parent_id uuid references public.categories (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint categories_scope check (
    case when is_system then owner_user_id is null and space_id is null
    else (owner_user_id is null) <> (space_id is null) end
  )
);

alter table public.categories enable row level security;

create trigger set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index categories_space_id_idx on public.categories (space_id) where space_id is not null;

-- Danh mục hệ thống (is_system) hiển thị cho tất cả; danh mục người dùng tạo
-- theo quy tắc riêng/chung như trên. Chỉ migration/seed được tạo is_system.
create policy "categories_select"
  on public.categories for select
  to authenticated
  using (
    is_system
    or owner_user_id = auth.uid()
    or (space_id is not null and public.is_space_member(space_id))
  );

create policy "categories_insert"
  on public.categories for insert
  to authenticated
  with check (
    not is_system
    and (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)))
  );

create policy "categories_update"
  on public.categories for update
  to authenticated
  using (
    not is_system
    and (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)))
  )
  with check (
    not is_system
    and (owner_user_id = auth.uid() or (space_id is not null and public.is_space_member(space_id)))
  );
