-- SPEC.md mục 5: người kia chỉ đọc tài sản riêng của bạn qua RPC này (security
-- definer), trả về dữ liệu đã redact đúng theo asset_share_level của BẠN
-- (hidden: không có gì; total: chỉ tổng; full: từng tài sản). Việc redact
-- phải làm ở server vì client không được nhận dữ liệu thô rồi tự ẩn ở UI.
--
-- Công thức định giá lặp lại tối thiểu công thức ở packages/core/src/assets
-- (vàng: gram × giá mua vào mới nhất cùng loại; ngoại tệ: số lượng × tỷ giá
-- mua vào mới nhất; tiết kiệm: gốc; khác: giá trị nhập tay) — đây là ranh
-- giới bảo mật bắt buộc phải tính ở SQL, không thể gọi lại packages/core.
create or replace function public.get_partner_asset_summary(target_space_id uuid)
returns table (
  share_level text,
  total_value bigint,
  assets jsonb
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  partner_id uuid;
  level text;
  total bigint;
  items jsonb;
begin
  if not public.is_space_member(target_space_id) then
    raise exception 'Không phải thành viên của không gian này';
  end if;

  select sm.user_id, sm.asset_share_level into partner_id, level
  from public.space_members sm
  where sm.space_id = target_space_id
    and sm.user_id <> auth.uid()
    and sm.left_at is null
  limit 1;

  if partner_id is null or level = 'hidden' then
    return query select coalesce(level, 'hidden'), null::bigint, null::jsonb;
    return;
  end if;

  with owned as (
    -- Chỉ tài sản RIÊNG của partner (đúng 1 chủ sở hữu hiện hành).
    select a.*
    from public.assets a
    join public.asset_ownerships o on o.asset_id = a.id and o.valid_to is null
    where o.user_id = partner_id
      and (
        select count(*) from public.asset_ownerships o2
        where o2.asset_id = a.id and o2.valid_to is null
      ) = 1
  ),
  valued as (
    select
      owned.id,
      owned.kind,
      owned.name,
      case owned.kind
        when 'gold' then round(owned.grams * (
          select pq.buy_price from public.price_quotes pq
          where pq.instrument = 'gold_' || owned.gold_type and pq.unit = 'gram'
          order by pq.quoted_at desc limit 1
        ))
        when 'savings' then owned.principal
        when 'fx' then round(owned.fx_amount_minor * (
          select pq.buy_price from public.price_quotes pq
          where pq.instrument = owned.fx_currency and pq.unit = 'unit'
          order by pq.quoted_at desc limit 1
        ))
        else owned.manual_value
      end as value
    from owned
  )
  select
    coalesce(sum(value), 0),
    coalesce(jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'name', name, 'value', value)), '[]'::jsonb)
  into total, items
  from valued;

  if level = 'total' then
    return query select level, total, null::jsonb;
  else
    return query select level, total, items;
  end if;
end;
$$;

grant execute on function public.get_partner_asset_summary(uuid) to authenticated;
