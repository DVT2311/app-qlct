-- Dữ liệu mẫu Minh & Lan, tháng 9/2026 — SPEC.md mục 9. Dùng để test RLS và
-- phát triển local. Số liệu tài sản/vàng ở đây khớp GẦN ĐÚNG các con số ví dụ
-- trong SPEC (sai số vài đồng do giá/gram không tròn) — nguồn xác thực chính
-- xác tới từng đồng là các test "golden" trong packages/core (đã 100% pass).
--
-- Toàn bộ script chạy trong một transaction vì các constraint trigger kiểm
-- tra tổng allocation là DEFERRED (chỉ kiểm tra lúc COMMIT).
begin;

-- ============================================================
-- 1. Tài khoản + hồ sơ (trigger handle_new_user tự tạo profiles)
-- ============================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'minh@sodoi.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Minh"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'lan@sodoi.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Lan"}',
   now(), now(), '', '', '', '');

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'minh@sodoi.test'),
   'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'lan@sodoi.test'),
   'email', now(), now(), now());

update public.profiles set avatar_color = '#1F5F8B' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set avatar_color = '#B4502A' where id = '22222222-2222-2222-2222-222222222222';

-- ============================================================
-- 2. Không gian chung (insert trực tiếp — seed chạy ngoài phiên
--    đăng nhập nên không gọi được RPC create_space/redeem_space_invite,
--    vốn dựa vào auth.uid()).
-- ============================================================
insert into public.spaces (id, name, status, default_split_mode, settle_day, created_by)
values ('33333333-3333-3333-3333-333333333333', 'Minh & Lan', 'active', 'even', 0,
        '11111111-1111-1111-1111-111111111111');

insert into public.space_members (space_id, user_id, default_ratio_bps, asset_share_level)
values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 5000, 'total'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 5000, 'total');

-- ============================================================
-- 3. Danh mục hệ thống
-- ============================================================
insert into public.categories (id, is_system, name, kind, icon, color) values
  ('c0000000-0000-0000-0000-000000000001', true, 'Nhà ở', 'expense', 'home', '#B4502A'),
  ('c0000000-0000-0000-0000-000000000002', true, 'Ăn uống', 'expense', 'utensils', '#8A6412'),
  ('c0000000-0000-0000-0000-000000000003', true, 'Giải trí', 'expense', 'film', '#2F6A4A'),
  ('c0000000-0000-0000-0000-000000000004', true, 'Hóa đơn & tiện ích', 'expense', 'bolt', '#1F5F8B'),
  ('c0000000-0000-0000-0000-000000000005', true, 'Lương', 'income', 'wallet', '#2F6A4A');

-- ============================================================
-- 4. Ví — opening_balance chọn sao cho số dư sau các giao dịch tháng 9 dưới
--    đây khớp đúng bảng "Tài sản" ở SPEC mục 9 cho các ví của Minh.
-- ============================================================
insert into public.wallets (id, owner_user_id, name, kind, opening_balance) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Vietcombank', 'bank', 42_210_000),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Tiền mặt', 'cash', 4_320_000),
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Thẻ tín dụng TPBank', 'credit_card', -3_100_000),
  ('a0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222',
   'MBBank', 'bank', 15_000_000);

insert into public.wallets (id, space_id, name, kind, opening_balance) values
  ('a0000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333',
   'Quỹ chung', 'shared_fund', 0);

-- ============================================================
-- 5. Giao dịch chung tháng 9/2026 (SPEC mục 9)
-- ============================================================

-- 05/09 Tiền nhà tháng 9 — 7.000.000, Minh trả, chia 60/40
insert into public.transactions
  (id, type, amount, wallet_id, space_id, paid_by, category_id, note, split_mode, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000001', 'expense', 7_000_000,
   'a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   '11111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000001',
   'Tiền nhà tháng 9', 'ratio', '2026-09-05', '11111111-1111-1111-1111-111111111111');

insert into public.transaction_allocations (transaction_id, user_id, amount) values
  ('e0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 4_200_000),
  ('e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 2_800_000);

-- 18/09 Lan chuyển trả (settlement) — 1.450.000
insert into public.transactions
  (id, type, amount, wallet_id, to_wallet_id, space_id, paid_by, paid_to, note, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000002', 'settlement', 1_450_000,
   'a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   '33333333-3333-3333-3333-333333333333',
   '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Lan chuyển trả', '2026-09-18', '22222222-2222-2222-2222-222222222222');

-- 20/09 Vé xem phim — 350.000, Lan trả, chia đều
insert into public.transactions
  (id, type, amount, wallet_id, space_id, paid_by, category_id, note, split_mode, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000003', 'expense', 350_000,
   'a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
   '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000003',
   'Vé xem phim', 'even', '2026-09-20', '22222222-2222-2222-2222-222222222222');

insert into public.transaction_allocations (transaction_id, user_id, amount) values
  ('e0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 175_000),
  ('e0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 175_000);

-- 22/09 Tiền điện tháng 9 — 850.000, Lan trả, chia đều
insert into public.transactions
  (id, type, amount, wallet_id, space_id, paid_by, category_id, note, split_mode, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000004', 'expense', 850_000,
   'a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
   '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000004',
   'Tiền điện tháng 9', 'even', '2026-09-22', '22222222-2222-2222-2222-222222222222');

insert into public.transaction_allocations (transaction_id, user_id, amount) values
  ('e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 425_000),
  ('e0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 425_000);

-- 24/09 Ăn tối kỷ niệm — 1.000.000, Minh trả, chia đều
insert into public.transactions
  (id, type, amount, wallet_id, space_id, paid_by, category_id, note, split_mode, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000005', 'expense', 1_000_000,
   'a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   '11111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000002',
   'Ăn tối kỷ niệm', 'even', '2026-09-24', '11111111-1111-1111-1111-111111111111');

insert into public.transaction_allocations (transaction_id, user_id, amount) values
  ('e0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 500_000),
  ('e0000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 500_000);

-- Chi tiêu riêng của Minh trong tháng — 3.120.000 (SPEC mục 9)
insert into public.transactions
  (id, type, amount, wallet_id, category_id, note, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000006', 'expense', 3_120_000,
   'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002',
   'Chi tiêu cá nhân tháng 9', '2026-09-15', '11111111-1111-1111-1111-111111111111');

insert into public.transaction_allocations (transaction_id, user_id, amount) values
  ('e0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 3_120_000);

-- Góp vào quỹ chung (Minh 11.160.000, Lan 7.440.000)
insert into public.transactions
  (id, type, amount, wallet_id, to_wallet_id, space_id, paid_by, note, occurred_on, created_by)
values
  ('e0000000-0000-0000-0000-000000000007', 'contribution', 11_160_000,
   'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005',
   '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Góp quỹ chung', '2026-09-01', '11111111-1111-1111-1111-111111111111'),
  ('e0000000-0000-0000-0000-000000000008', 'contribution', 7_440_000,
   'a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005',
   '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
   'Góp quỹ chung', '2026-09-01', '22222222-2222-2222-2222-222222222222');

-- ============================================================
-- 6. Ngân sách tháng 9 của Minh — 12.000.000 (SPEC mục 9)
-- ============================================================
insert into public.budgets (owner_user_id, month, amount)
values ('11111111-1111-1111-1111-111111111111', '2026-09-01', 12_000_000);

-- ============================================================
-- 7. Giá vàng — dùng để định giá tài sản vàng bên dưới (packages/core
--    src/assets/assets.ts tính grams × buy_price).
-- ============================================================
insert into public.price_quotes (instrument, unit, buy_price, sell_price, source, quoted_at) values
  ('gold_sjc_bar', 'gram', 3_906_667, 3_950_000, 'manual', now()),
  ('gold_ring_9999', 'gram', 3_706_667, 3_750_000, 'manual', now());

-- ============================================================
-- 8. Tài sản (SPEC mục 9)
-- ============================================================

-- Sổ tiết kiệm Techcombank — Minh 100%
insert into public.assets (id, kind, name, bank_name, principal, rate_bps, term_months, opened_on, matures_on, origin)
values ('f0000000-0000-0000-0000-000000000001', 'savings', 'Sổ tiết kiệm Techcombank 12 tháng',
        'Techcombank', 150_000_000, 500, 12, '2026-09-01', '2027-09-01', 'self');

insert into public.asset_ownerships (asset_id, user_id, share_bps)
values ('f0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 10_000);

-- Vàng miếng SJC 2 chỉ (7,5g) — Minh 100%
insert into public.assets (id, kind, name, gold_type, grams, purchase_price, purchased_on, origin)
values ('f0000000-0000-0000-0000-000000000002', 'gold', 'Vàng miếng SJC 2 chỉ',
        'sjc_bar', 7.5, 26_400_000, '2025-03-10', 'self');

insert into public.asset_ownerships (asset_id, user_id, share_bps)
values ('f0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 10_000);

-- Nhẫn trơn 9999 3 chỉ (11,25g) — Minh 50% / Lan 50%, quà gia đình
insert into public.assets (id, kind, name, gold_type, grams, origin, origin_note, space_id)
values ('f0000000-0000-0000-0000-000000000003', 'gold', 'Nhẫn trơn 9999 3 chỉ',
        'ring_9999', 11.25, 'gift', 'Quà gia đình', '33333333-3333-3333-3333-333333333333');

insert into public.asset_ownerships (asset_id, user_id, share_bps) values
  ('f0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 5_000),
  ('f0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 5_000);

-- Sổ tiết kiệm mua nhà — Minh 60% / Lan 40%
insert into public.assets (id, kind, name, bank_name, principal, rate_bps, term_months, opened_on, matures_on, origin, space_id)
values ('f0000000-0000-0000-0000-000000000004', 'savings', 'Sổ tiết kiệm mua nhà',
        'Vietcombank', 120_000_000, 480, 6, '2026-06-01', '2026-12-01', 'self',
        '33333333-3333-3333-3333-333333333333');

insert into public.asset_ownerships (asset_id, user_id, share_bps) values
  ('f0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 6_000),
  ('f0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 4_000);

-- asset_events 'created' cho cả 4 tài sản (khớp với RPC create_asset ở luồng thật)
insert into public.asset_events (asset_id, kind, status, created_by) values
  ('f0000000-0000-0000-0000-000000000001', 'created', 'confirmed', '11111111-1111-1111-1111-111111111111'),
  ('f0000000-0000-0000-0000-000000000002', 'created', 'confirmed', '11111111-1111-1111-1111-111111111111'),
  ('f0000000-0000-0000-0000-000000000003', 'created', 'confirmed', '11111111-1111-1111-1111-111111111111'),
  ('f0000000-0000-0000-0000-000000000004', 'created', 'confirmed', '11111111-1111-1111-1111-111111111111');

-- ============================================================
-- 9. Mục tiêu chung (SPEC mục 9)
-- ============================================================
insert into public.goals (id, space_id, name, target_amount, deadline, status) values
  ('90000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   'Quỹ cưới', 250_000_000, '2027-12-31', 'active'),
  ('90000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333',
   'Quỹ mua nhà', 600_000_000, '2029-12-31', 'active');

insert into public.goal_links (goal_id, wallet_id) values
  ('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005');
insert into public.goal_links (goal_id, asset_id) values
  ('90000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003'),
  ('90000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004');

commit;
