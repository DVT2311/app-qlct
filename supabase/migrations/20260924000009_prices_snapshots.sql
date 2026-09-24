create table public.price_quotes (
  id uuid primary key default gen_random_uuid(),
  instrument text not null, -- 'gold_sjc_bar' | 'gold_ring_9999' | 'gold_jewelry' | 'USD' | ...
  unit text not null check (unit in ('gram', 'unit')),
  buy_price bigint not null,
  sell_price bigint not null,
  source text not null,
  quoted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.price_quotes enable row level security;

create trigger set_updated_at
  before update on public.price_quotes
  for each row execute function public.set_updated_at();

create index price_quotes_instrument_quoted_at_idx
  on public.price_quotes (instrument, quoted_at desc);

-- Giá vàng/tỷ giá là dữ liệu thị trường dùng chung, không thuộc riêng ai
-- (SPEC.md mục 7). MVP: ai đăng nhập cũng nhập tay được (ManualProvider).
create policy "price_quotes_select_all"
  on public.price_quotes for select
  to authenticated
  using (true);

create policy "price_quotes_insert_authenticated"
  on public.price_quotes for insert
  to authenticated
  with check (true);

-- Snapshot tài sản ròng hằng ngày — chỉ Edge Function (service role, bỏ qua
-- RLS) mới ghi. Client chỉ đọc snapshot của chính mình.
create table public.networth_snapshots (
  user_id uuid not null references public.profiles (id),
  on_date date not null,
  wallets bigint not null,
  fund_share bigint not null,
  assets_share bigint not null,
  receivable bigint not null,
  payable bigint not null,
  net bigint not null,
  primary key (user_id, on_date)
);

alter table public.networth_snapshots enable row level security;

create policy "networth_snapshots_select_self"
  on public.networth_snapshots for select
  to authenticated
  using (user_id = auth.uid());
