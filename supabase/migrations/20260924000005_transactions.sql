create table public.transactions (
  id uuid primary key default gen_random_uuid(), -- sinh phía client (CLAUDE.md quy tắc 7)
  type text not null check (type in ('expense', 'income', 'transfer', 'contribution', 'settlement')),
  amount bigint not null check (amount > 0),
  currency text not null default 'VND',
  wallet_id uuid references public.wallets (id),
  to_wallet_id uuid references public.wallets (id),
  space_id uuid references public.spaces (id),
  paid_by uuid references public.profiles (id),
  paid_to uuid references public.profiles (id),
  category_id uuid references public.categories (id),
  note text,
  split_mode text check (split_mode in ('even', 'ratio', 'custom', 'payer_all')),
  occurred_on date not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.transactions enable row level security;

create trigger set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create index transactions_space_id_idx on public.transactions (space_id) where space_id is not null;
create index transactions_wallet_id_idx on public.transactions (wallet_id);
create index transactions_occurred_on_idx on public.transactions (occurred_on);

-- Riêng (space_id null): chỉ người tạo đọc/ghi. Chung: mọi thành viên đang
-- hoạt động đọc/ghi (SPEC.md mục 4.3, mục 5). Không có policy delete — xoá
-- mềm qua update deleted_at.
create policy "transactions_select"
  on public.transactions for select
  to authenticated
  using (
    (space_id is null and created_by = auth.uid())
    or (space_id is not null and public.is_space_member(space_id))
  );

create policy "transactions_insert"
  on public.transactions for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (
      (space_id is null and created_by = auth.uid())
      or (space_id is not null and public.is_space_member(space_id))
    )
  );

create policy "transactions_update"
  on public.transactions for update
  to authenticated
  using (
    (space_id is null and created_by = auth.uid())
    or (space_id is not null and public.is_space_member(space_id))
  )
  with check (
    (space_id is null and created_by = auth.uid())
    or (space_id is not null and public.is_space_member(space_id))
  );

-- Bảng nối: không có id/timestamp riêng, đúng theo SPEC.md mục 6.
create table public.transaction_allocations (
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  amount bigint not null,
  primary key (transaction_id, user_id)
);

alter table public.transaction_allocations enable row level security;

-- Ai xem được giao dịch cha thì xem/ghi được dòng phân bổ của nó.
create policy "transaction_allocations_select"
  on public.transaction_allocations for select
  to authenticated
  using (exists (select 1 from public.transactions t where t.id = transaction_allocations.transaction_id));

create policy "transaction_allocations_insert"
  on public.transaction_allocations for insert
  to authenticated
  with check (exists (select 1 from public.transactions t where t.id = transaction_allocations.transaction_id));

create policy "transaction_allocations_update"
  on public.transaction_allocations for update
  to authenticated
  using (exists (select 1 from public.transactions t where t.id = transaction_allocations.transaction_id))
  with check (exists (select 1 from public.transactions t where t.id = transaction_allocations.transaction_id));

create policy "transaction_allocations_delete"
  on public.transaction_allocations for delete
  to authenticated
  using (exists (select 1 from public.transactions t where t.id = transaction_allocations.transaction_id));

-- Tổng allocation phải bằng đúng amount cho expense/income (SPEC.md mục 4.2),
-- gương với packages/core/src/allocations. Constraint trigger DEFERRED vì
-- các dòng allocation được insert nhiều dòng trong cùng 1 transaction DB với
-- dòng transactions cha — chỉ kiểm tra lúc COMMIT.
create or replace function public.check_allocation_total_from_allocations()
returns trigger
language plpgsql
as $$
declare
  tx public.transactions;
  total bigint;
begin
  select * into tx from public.transactions where id = coalesce(new.transaction_id, old.transaction_id);

  if tx.id is null or tx.type not in ('expense', 'income') then
    return coalesce(new, old);
  end if;

  select coalesce(sum(amount), 0) into total
  from public.transaction_allocations
  where transaction_id = tx.id;

  if total <> tx.amount then
    raise exception 'Tổng allocation (%) phải bằng amount giao dịch (%)', total, tx.amount;
  end if;

  return coalesce(new, old);
end;
$$;

create constraint trigger check_allocation_total_from_allocations
  after insert or update or delete on public.transaction_allocations
  deferrable initially deferred
  for each row execute function public.check_allocation_total_from_allocations();

-- Cùng ràng buộc nhưng kích hoạt khi transactions.amount/type đổi sau khi đã
-- có allocations (allocations không đổi thì không có gì trigger ở trên).
create or replace function public.check_allocation_total_from_transaction()
returns trigger
language plpgsql
as $$
declare
  total bigint;
begin
  if new.type not in ('expense', 'income') then
    return new;
  end if;

  select coalesce(sum(amount), 0) into total
  from public.transaction_allocations
  where transaction_id = new.id;

  if total <> new.amount then
    raise exception 'Tổng allocation (%) phải bằng amount giao dịch (%)', total, new.amount;
  end if;

  return new;
end;
$$;

create constraint trigger check_allocation_total_from_transaction
  after insert or update of amount, type on public.transactions
  deferrable initially deferred
  for each row execute function public.check_allocation_total_from_transaction();

-- SPEC.md mục 5: khi một giao dịch chung được trả từ ví cá nhân, người kia
-- thấy giao dịch và TÊN ví ("Ví của Minh") nhưng không thấy số dư ví đó.
-- wallets RLS chặn hẳn select ví riêng của người khác, nên dùng RPC hẹp này
-- để trả về đúng mỗi cái tên, chỉ khi ví đó thực sự gắn với một giao dịch
-- chung mà caller được xem.
create or replace function public.get_wallet_display_name(target_wallet_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select w.name
  from public.wallets w
  where w.id = target_wallet_id
    and (
      w.owner_user_id = auth.uid()
      or (w.space_id is not null and public.is_space_member(w.space_id))
      or exists (
        select 1 from public.transactions t
        where (t.wallet_id = w.id or t.to_wallet_id = w.id)
          and t.space_id is not null
          and public.is_space_member(t.space_id)
      )
    );
$$;

grant execute on function public.get_wallet_display_name(uuid) to authenticated;
