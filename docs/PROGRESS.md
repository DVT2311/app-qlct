# Tiến độ dự án Sổ Đôi

> **Đọc file này đầu tiên** khi bắt đầu một phiên làm việc mới (trước
> cả `docs/SPEC.md`) để biết đã làm gì, đang làm gì, và làm tiếp ở đâu.
> Sau khi hoàn thành việc gì đáng kể (xong một milestone, sửa một bug
> quan trọng, đổi quyết định kiến trúc) — **cập nhật lại file này**,
> đừng để người dùng phải nhắc. Xem cấu trúc thư mục chi tiết ở
> `docs/STRUCTURE.md`.

## Trạng thái hiện tại

- Đã hoàn tất **M0, M1, M2**. Đã push lên GitHub: https://github.com/DVT2311/app-qlct (nhánh `main`).
- Đã test thủ công trên web (`localhost:3000`) và mobile qua Expo Go thật trên điện thoại — đăng nhập/đăng ký email hoạt động, RLS đã verify đúng.
- **Việc tiếp theo**: bắt đầu **M3 — Chi tiêu cá nhân trên mobile** (xem mục bên dưới).

## Milestone (SPEC.md mục 10)

| #   | Tên                           | Trạng thái      | Ghi chú                                                                                                                                                                                                                                                                                                                                                             |
| --- | ----------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | Khởi tạo monorepo             | ✅ Xong         | pnpm + Turborepo, ESLint/Prettier, `packages/core` + `tokens` + `db-types`, `apps/web` + `apps/mobile` scaffold, CI (lint+typecheck+test)                                                                                                                                                                                                                           |
| M1  | Logic lõi                     | ✅ Xong         | `packages/core`: money, split (4 kiểu), allocations, balance, fund, assets (định giá), net-worth, goals, reports. 69 test, coverage 96.66%. Toàn bộ test golden SPEC mục 9 pass                                                                                                                                                                                     |
| M2  | Schema, RLS, xác thực         | ✅ Xong         | 10 migration (SPEC mục 6), RLS bật mọi bảng, RPC `create_space`/`redeem_space_invite`/`create_asset`/`get_partner_asset_summary`/`get_wallet_display_name`, seed Minh & Lan. **RLS đã verify thật** qua Auth API + REST (Lan không đọc được ví/giao dịch riêng của Minh). Đăng nhập email/password + nút Google (web dùng `@supabase/ssr`, mobile dùng SecureStore) |
| M3  | Chi tiêu cá nhân trên mobile  | ⬜ Chưa bắt đầu | Xem việc cần làm bên dưới                                                                                                                                                                                                                                                                                                                                           |
| M4  | Tài sản cá nhân               | ⬜ Chưa bắt đầu |                                                                                                                                                                                                                                                                                                                                                                     |
| M5  | Lớp cặp đôi                   | ⬜ Chưa bắt đầu |                                                                                                                                                                                                                                                                                                                                                                     |
| M6  | Web dashboard                 | ⬜ Chưa bắt đầu |                                                                                                                                                                                                                                                                                                                                                                     |
| M7  | Hoàn thiện & phát hành nội bộ | ⬜ Chưa bắt đầu |                                                                                                                                                                                                                                                                                                                                                                     |

## Việc cần làm tiếp theo (M3)

Theo SPEC.md mục 10, milestone M3 gồm:

- [ ] RPC tạo giao dịch + allocations **atomic** trong 1 lệnh gọi (bắt buộc — xem "Nợ kỹ thuật" bên dưới, có mẫu sẵn ở `create_asset`)
- [ ] CRUD ví (wallets) — màn hình quản lý ví
- [ ] CRUD danh mục (categories) — kế thừa danh mục hệ thống đã có trong seed
- [ ] Màn Thêm giao dịch (SPEC mục 8.2 §2): số tiền, nội dung, danh mục (chip), toggle Chi riêng/Chi chung — phần chung (split 4 kiểu) để dành logic UI cho M5, nhưng luồng nhập **riêng** phải xong ở M3
- [ ] Giao dịch `transfer` giữa 2 ví cùng chủ
- [ ] Ngân sách tháng theo danh mục (budgets) — CRUD + hiển thị thanh ngân sách
- [ ] Trang chủ góc nhìn **Cá nhân** (SPEC mục 8.2 §1): chi tiêu tháng, thanh ngân sách, danh sách ví riêng, giao dịch gần đây
- [ ] Hàng đợi thao tác khi mất mạng (TanStack Query persist + mutation queue)
- [ ] Khóa app bằng PIN/sinh trắc học (`expo-local-authentication`)

**Nghiệm thu M3** (đừng chuyển sang M4 trước khi đạt): nhập giao dịch khi tắt mạng, bật lại thì đồng bộ không trùng.

## Nợ kỹ thuật / vấn đề đang mở

- **Đăng nhập Google/Apple**: nút UI đã có nhưng CHƯA hoạt động — cần OAuth client ID/secret thật (Google Cloud Console, Apple Developer), chưa có trong môi trường này. Đăng nhập email/password đã hoạt động đầy đủ.
- **PostgREST không giữ transaction giữa 2 HTTP request riêng biệt.** Khi tạo `transactions` + `transaction_allocations` PHẢI gộp trong **một** RPC Postgres (giống mẫu `create_asset` ở `supabase/migrations/20260924000007_assets.sql`) — chưa viết RPC này cho transactions, **cần làm đầu tiên ở M3** trước khi xây màn Thêm giao dịch.
- Câu hỏi còn mở từ SPEC.md mục 12 (chưa cần trả lời ngay, nhưng ảnh hưởng thiết kế sau này): hai người đã sống chung chưa (ảnh hưởng danh mục/ngân sách mặc định), nguồn giá vàng tự động dùng nhà cung cấp nào, tên chính thức của app.

## Ghi chú môi trường dev (máy hiện tại)

- **Docker Desktop** cài ở `AppData\Local\Programs\DockerDesktop`, không nằm trong PATH mặc định của Git Bash. Đầu mỗi phiên bash mới cần:
  ```
  export PATH="/c/Users/dinhv/AppData/Local/Programs/DockerDesktop/resources/bin:$PATH"
  ```
  trước khi chạy `docker` hoặc `npx supabase ...`.
- Ổ đĩa ảo Docker đã chuyển sang `D:\DockerWSL` (ổ C từng đầy 0.7 GB gây lỗi "read-only file system" khi pull image — nếu gặp lại lỗi này, kiểm tra dung lượng ổ C trước).
- Firewall Windows: đã mở inbound cho port `8081` (Metro) và `54321` (Supabase) trên mọi profile; đã xoá 2 rule Block tự động Windows tạo cho `com.docker.backend.exe` trên mạng Public, thay bằng rule "Docker Backend Allow".
- Mạng Wi-Fi máy hiện bị Windows nhận diện là "Public" (không đổi được sang Private vì thiếu quyền admin lúc kiểm tra) — nếu đổi router/mạng mới và mobile lại không kết nối được, lặp lại các bước mở firewall ở trên.
- Chạy `pnpm dev` ở root để chạy song song web (`:3000`) + Metro (`:8081`). Sau khi sửa code liên quan tới SecureStore/AsyncStorage hoặc đổi biến môi trường, cần **restart** `pnpm dev` (không chỉ hot-reload) vì Windows đôi khi giữ lại tiến trình cũ chiếm cổng — dùng `Get-NetTCPConnection -LocalPort 3000,8081 -State Listen | Stop-Process` trong PowerShell nếu cổng bị chiếm.
- QR code Expo Go dùng IP LAN của máy dev (xem `apps/mobile/.env`), không dùng `127.0.0.1`.
- `supabase start` / `supabase db reset` chạy trong `D:\APP\App QLCT` (root). Tài khoản test: `minh@sodoi.test` / `lan@sodoi.test`, mật khẩu `password123`.

## Golden test / dữ liệu mẫu

- `supabase/seed.sql`: tài khoản Minh & Lan thật (qua `auth.users`), dữ liệu tháng 9/2026 theo SPEC.md mục 9.
- `packages/core/src/golden.test.ts`: test tích hợp nối toàn bộ module `packages/core` theo đúng kịch bản SPEC mục 9 — mọi con số phải khớp chính xác tới từng đồng.
