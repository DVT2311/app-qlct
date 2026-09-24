# Sổ Đôi — hướng dẫn cho Claude Code

Ứng dụng quản lý tài chính cá nhân cho **cặp đôi trước hôn nhân**: mỗi người có sổ chi tiêu và tài sản riêng đầy đủ, và khi ghép đôi thì có thêm một "không gian chung" để quản lý khoản chi chung, chia tiền, số dư nợ, quỹ chung, tài sản chung và mục tiêu chung. Gồm app mobile (Android + iOS) và web dashboard.

Đặc tả đầy đủ: **`docs/SPEC.md`** — đọc trước khi làm bất kỳ tính năng nào. Mục 4 (quy tắc kế toán) là phần quan trọng nhất.

## Công nghệ

- Monorepo **pnpm + Turborepo**, toàn bộ **TypeScript** (strict).
- `apps/mobile`: **Expo (React Native) + Expo Router**, TanStack Query, Zustand cho state UI.
- `apps/web`: **Next.js (App Router)**, Recharts cho biểu đồ.
- `packages/core`: logic nghiệp vụ thuần TypeScript, không phụ thuộc UI hay DB (tiền tệ, chia tiền, số dư, định giá tài sản, tài sản ròng). Test bằng **Vitest**.
- `packages/tokens`: màu sắc, font, khoảng cách dùng chung cho mobile và web.
- `supabase/`: migrations SQL, seed, Edge Functions (lấy giá, snapshot tài sản ròng). Dùng **Supabase** (Postgres + Auth + Row Level Security + cron).
- Validation: **zod** ở mọi ranh giới (form, API, dữ liệu từ DB).

## Cấu trúc thư mục

```
apps/mobile        # Expo app
apps/web           # Next.js dashboard
packages/core      # logic nghiệp vụ + test
packages/tokens    # design tokens
packages/db-types  # type sinh từ Supabase (supabase gen types)
supabase/migrations
supabase/functions
supabase/seed.sql  # dữ liệu mẫu Minh & Lan (xem SPEC mục 9)
docs/SPEC.md
```

## Lệnh thường dùng

```
pnpm install
supabase start && supabase db reset     # DB local + seed
pnpm dev                                 # chạy song song mobile + web
pnpm --filter core test                  # test logic nghiệp vụ
pnpm lint && pnpm typecheck
supabase gen types typescript --local > packages/db-types/index.ts
```

## Quy tắc bắt buộc

1. **Tiền luôn là số nguyên** (`bigint` trong DB, `number` nguyên an toàn hoặc `bigint` trong TS). VND không có phần thập phân. Tuyệt đối không dùng số thực cho tiền. Mọi phép tính tiền đi qua helper trong `packages/core/money`.
2. **Vàng lưu theo gram** (`numeric(12,4)`), quy đổi khi hiển thị: 1 chỉ = 3,75 g; 1 lượng = 10 chỉ = 37,5 g.
3. **Tỷ lệ sở hữu và tỷ lệ chia lưu bằng basis point** (10000 = 100%), số nguyên.
4. Logic nghiệp vụ **chỉ nằm trong `packages/core`**; mobile, web và Edge Functions đều gọi lại, không viết lại công thức ở nơi khác.
5. **Báo cáo chi tiêu cá nhân đọc từ bảng `transaction_allocations`**, số dư ví đọc từ `transactions`. Xem SPEC mục 4.
6. **RLS bật cho mọi bảng** ngay từ migration đầu tiên. Không bao giờ dùng service role key trong app client.
7. Mọi bản ghi có `id uuid` sinh phía client, `created_at`, `updated_at`, `deleted_at` (xóa mềm).
8. Không viết cứng tên người dùng, số thành viên hay "Minh/Lan" trong code; không gian chung là thực thể tổng quát có danh sách thành viên.
9. Mọi chuỗi hiển thị nằm trong file ngôn ngữ (`vi.json`), kể cả khi mới chỉ có tiếng Việt.
10. Định dạng tiền kiểu Việt Nam: `1.250.000 ₫`; rút gọn `8,42 tr` chỉ dùng trong biểu đồ.
11. Mỗi thay đổi trong `packages/core` phải có test; test "golden" ở SPEC mục 9 luôn phải xanh.

## Cách làm việc

- Làm theo thứ tự milestone ở SPEC mục 10; mỗi milestone kết thúc bằng tiêu chí nghiệm thu ghi ở đó.
- Trước khi sửa schema: viết migration mới, không sửa migration cũ đã áp dụng.
- Khi yêu cầu mơ hồ về nghiệp vụ tiền, **dừng lại và hỏi** thay vì tự đoán.
