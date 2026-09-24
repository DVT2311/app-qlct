create table public.assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('gold', 'savings', 'fx', 'other')),
  name text not null,
  -- vàng
  gold_type text check (gold_type in ('sjc_bar', 'ring_9999', 'jewelry')),
  grams numeric(12, 4),
  -- tiết kiệm
  bank_name text,
  principal bigint,
  rate_bps int,
  term_months int,
  opened_on date,
  matures_on date,
  -- ngoại tệ
  fx_currency text,
  fx_amount_minor bigint,
  -- chung
  purchase_price bigint,
  purchased_on date,
  manual_value bigint,
  origin text check (origin in ('self', 'gift', 'inheritance', 'wedding_gift', 'other')),
  origin_note text,
  space_id uuid references public.spaces (id), -- set khi tài sản có từ 2 chủ trở lên
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.assets enable row level security;

create trigger set_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

create table public.asset_ownerships (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  share_bps int not null check (share_bps > 0 and share_bps <= 10000),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.asset_ownerships enable row level security;

create trigger set_updated_at
  before update on public.asset_ownerships
  for each row execute function public.set_updated_at();

create index asset_ownerships_asset_user_idx
  on public.asset_ownerships (asset_id, user_id)
  where valid_to is null;

create table public.asset_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  kind text not null check (kind in ('created', 'ownership_changed', 'value_updated', 'sold')),
  payload jsonb,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'rejected')),
  confirmations uuid[] not null default '{}',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.asset_events enable row level security;

create trigger set_updated_at
  before update on public.asset_events
  for each row execute function public.set_updated_at();

-- Helper: caller có đang là một chủ sở hữu hiện tại (valid_to null) của
-- tài sản không. Dùng cho cả tài sản riêng (1 chủ) lẫn chung (nhiều chủ).
create or replace function public.is_asset_owner(target_asset_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.asset_ownerships
    where asset_id = target_asset_id
      and user_id = auth.uid()
      and valid_to is null
  );
$$;

grant execute on function public.is_asset_owner(uuid) to authenticated;

-- SPEC.md mục 5: dữ liệu tài sản riêng chỉ chủ sở hữu đọc/ghi; tài sản chung
-- mọi đồng sở hữu đọc/ghi. Vì assets/asset_ownerships không có "chủ" tường
-- minh ngoài asset_ownerships, quyền được xác định qua is_asset_owner.
create policy "assets_select_owners"
  on public.assets for select
  to authenticated
  using (public.is_asset_owner(id));

create policy "assets_update_owners"
  on public.assets for update
  to authenticated
  using (public.is_asset_owner(id))
  with check (public.is_asset_owner(id));

create policy "asset_ownerships_select"
  on public.asset_ownerships for select
  to authenticated
  using (public.is_asset_owner(asset_id));

create policy "asset_events_select_owners"
  on public.asset_events for select
  to authenticated
  using (public.is_asset_owner(asset_id));

create policy "asset_events_insert_owners"
  on public.asset_events for insert
  to authenticated
  with check (public.is_asset_owner(asset_id) and created_by = auth.uid());

-- Không có policy insert cho assets/asset_ownerships: tạo tài sản luôn cần
-- một dòng ownership đi kèm ngay từ đầu (tổng share_bps = 10000), và vì FK
-- bắt asset phải tồn tại trước ownership, RLS insert thường (kiểm tra ngay
-- lúc statement) không thể enforce "phải có ownership hợp lệ" một cách atomic.
-- RPC create_asset dưới đây làm việc đó, chạy security definer.
create or replace function public.create_asset(asset_data jsonb, owners jsonb)
returns public.assets
language plpgsql
security definer
set search_path = public
as $$
declare
  new_asset public.assets;
  total_bps int;
  owner_row jsonb;
begin
  select coalesce(sum((o ->> 'share_bps')::int), 0) into total_bps
  from jsonb_array_elements(owners) as o;

  if total_bps <> 10000 then
    raise exception 'Tổng share_bps phải bằng 10000, nhận được %', total_bps;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(owners) as o
    where (o ->> 'user_id')::uuid = auth.uid()
  ) then
    raise exception 'Bạn phải là một trong các chủ sở hữu';
  end if;

  insert into public.assets (
    id, kind, name, gold_type, grams, bank_name, principal, rate_bps, term_months,
    opened_on, matures_on, fx_currency, fx_amount_minor, purchase_price, purchased_on,
    manual_value, origin, origin_note, space_id
  )
  values (
    coalesce((asset_data ->> 'id')::uuid, gen_random_uuid()),
    asset_data ->> 'kind',
    asset_data ->> 'name',
    asset_data ->> 'gold_type',
    (asset_data ->> 'grams')::numeric,
    asset_data ->> 'bank_name',
    (asset_data ->> 'principal')::bigint,
    (asset_data ->> 'rate_bps')::int,
    (asset_data ->> 'term_months')::int,
    (asset_data ->> 'opened_on')::date,
    (asset_data ->> 'matures_on')::date,
    asset_data ->> 'fx_currency',
    (asset_data ->> 'fx_amount_minor')::bigint,
    (asset_data ->> 'purchase_price')::bigint,
    (asset_data ->> 'purchased_on')::date,
    (asset_data ->> 'manual_value')::bigint,
    asset_data ->> 'origin',
    asset_data ->> 'origin_note',
    (asset_data ->> 'space_id')::uuid
  )
  returning * into new_asset;

  for owner_row in select * from jsonb_array_elements(owners)
  loop
    insert into public.asset_ownerships (asset_id, user_id, share_bps)
    values (new_asset.id, (owner_row ->> 'user_id')::uuid, (owner_row ->> 'share_bps')::int);
  end loop;

  insert into public.asset_events (asset_id, kind, payload, created_by)
  values (new_asset.id, 'created', asset_data, auth.uid());

  return new_asset;
end;
$$;

grant execute on function public.create_asset(jsonb, jsonb) to authenticated;
