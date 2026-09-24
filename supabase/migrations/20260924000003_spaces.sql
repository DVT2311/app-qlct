create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  default_split_mode text not null default 'even'
    check (default_split_mode in ('even', 'ratio', 'custom', 'payer_all')),
  settle_day int not null default 0,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.spaces enable row level security;

create trigger set_updated_at
  before update on public.spaces
  for each row execute function public.set_updated_at();

-- Bảng nối: không có id/timestamp riêng, đúng theo SPEC.md mục 6.
create table public.space_members (
  space_id uuid not null references public.spaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  default_ratio_bps int not null default 5000,
  asset_share_level text not null default 'total'
    check (asset_share_level in ('hidden', 'total', 'full')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (space_id, user_id)
);

alter table public.space_members enable row level security;

create table public.space_invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public.profiles (id),
  expires_at timestamptz not null,
  used_by uuid references public.profiles (id),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.space_invites enable row level security;

create trigger set_updated_at
  before update on public.space_invites
  for each row execute function public.set_updated_at();

-- Helper: caller có đang là thành viên đang hoạt động của không gian không.
-- security definer để các policy khác gọi được mà không đệ quy RLS.
create or replace function public.is_space_member(target_space_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.space_members
    where space_id = target_space_id
      and user_id = auth.uid()
      and left_at is null
  );
$$;

grant execute on function public.is_space_member(uuid) to authenticated;

-- Helper: caller và other_user_id có đang chung một không gian đang hoạt động.
create or replace function public.shares_active_space_with(other_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.space_members me
    join public.space_members partner
      on partner.space_id = me.space_id
     and partner.user_id = other_user_id
     and partner.left_at is null
    where me.user_id = auth.uid()
      and me.left_at is null
  );
$$;

grant execute on function public.shares_active_space_with(uuid) to authenticated;

-- Bổ sung cho profiles (mục 5): xem hồ sơ người cùng không gian.
create policy "profiles_select_space_partner"
  on public.profiles for select
  to authenticated
  using (public.shares_active_space_with(id));

create policy "spaces_select_members"
  on public.spaces for select
  to authenticated
  using (public.is_space_member(id));

create policy "spaces_update_members"
  on public.spaces for update
  to authenticated
  using (public.is_space_member(id))
  with check (public.is_space_member(id));

create policy "space_members_select"
  on public.space_members for select
  to authenticated
  using (user_id = auth.uid() or public.is_space_member(space_id));

-- Chỉ cho tự sửa dòng của mình (đổi default_ratio_bps/asset_share_level,
-- hoặc rời không gian bằng cách set left_at). Tạo mới đi qua RPC bên dưới.
create policy "space_members_update_self"
  on public.space_members for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "space_invites_select_members"
  on public.space_invites for select
  to authenticated
  using (public.is_space_member(space_id));

create policy "space_invites_insert_members"
  on public.space_invites for insert
  to authenticated
  with check (created_by = auth.uid() and public.is_space_member(space_id));

-- Tạo không gian mới + tự thêm mình làm thành viên đầu tiên, atomic.
-- Không có policy insert trực tiếp cho spaces/space_members: mọi client đều
-- phải đi qua RPC này hoặc redeem_space_invite bên dưới, để đảm bảo ràng buộc
-- "một người chỉ thuộc tối đa 1 không gian đang hoạt động" (SPEC mục 2).
create or replace function public.create_space(space_name text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  new_space public.spaces;
begin
  if exists (
    select 1 from public.space_members
    where user_id = auth.uid() and left_at is null
  ) then
    raise exception 'Bạn đã thuộc một không gian đang hoạt động';
  end if;

  insert into public.spaces (id, name, created_by)
  values (gen_random_uuid(), space_name, auth.uid())
  returning * into new_space;

  insert into public.space_members (space_id, user_id)
  values (new_space.id, auth.uid());

  return new_space;
end;
$$;

grant execute on function public.create_space(text) to authenticated;

-- Ghép đôi bằng mã mời: kiểm tra hạn dùng, đã dùng chưa, không gian còn chỗ
-- (tối đa 2 thành viên MVP), rồi thêm thành viên + đánh dấu đã dùng, atomic.
create or replace function public.redeem_space_invite(invite_code text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.space_invites;
  target_space public.spaces;
  member_count int;
begin
  select * into invite
  from public.space_invites
  where code = invite_code and deleted_at is null;

  if not found then
    raise exception 'Mã mời không hợp lệ';
  end if;

  if invite.expires_at < now() then
    raise exception 'Mã mời đã hết hạn';
  end if;

  if invite.used_at is not null then
    raise exception 'Mã mời đã được sử dụng';
  end if;

  if exists (
    select 1 from public.space_members
    where user_id = auth.uid() and left_at is null
  ) then
    raise exception 'Bạn đã thuộc một không gian đang hoạt động';
  end if;

  select count(*) into member_count
  from public.space_members
  where space_id = invite.space_id and left_at is null;

  if member_count >= 2 then
    raise exception 'Không gian đã đủ thành viên';
  end if;

  insert into public.space_members (space_id, user_id)
  values (invite.space_id, auth.uid());

  update public.space_invites
  set used_by = auth.uid(), used_at = now()
  where id = invite.id;

  select * into target_space from public.spaces where id = invite.space_id;
  return target_space;
end;
$$;

grant execute on function public.redeem_space_invite(text) to authenticated;
