-- Tiện ích dùng chung cho mọi migration sau. RLS được bật ngay khi tạo từng
-- bảng (không có migration nào tạo bảng mà thiếu RLS) — CLAUDE.md quy tắc 6.

create extension if not exists "pgcrypto";

-- Tự động cập nhật updated_at mỗi khi UPDATE một dòng.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
