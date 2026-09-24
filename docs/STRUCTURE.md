# Cấu trúc dự án Sổ Đôi

> Phần cây thư mục ở cuối file này được **sinh tự động** bằng lệnh
> `pnpm docs:structure` (chạy `node scripts/generate-structure.js`) —
> không sửa tay đoạn đó. Phần chữ giải thích phía dưới là viết tay, chỉ
> cập nhật khi kiến trúc thật sự đổi (thêm package mới, dời thư mục
> lớn) — không cần sửa mỗi khi thêm một file lẻ.

## Đi đâu để làm gì

| Muốn làm...                                                                            | Vào đây                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Sửa/thêm công thức nghiệp vụ (chia tiền, số dư nợ, tài sản ròng, mục tiêu, báo cáo...) | `packages/core/src/<domain>/` — mỗi domain một thư mục kèm test. Export qua `src/index.ts`              |
| Đổi màu sắc, font, spacing, bo góc dùng chung                                          | `packages/tokens/src/`                                                                                  |
| Sửa schema DB / RLS / RPC                                                              | `supabase/migrations/*.sql` — viết migration **mới**, không sửa migration cũ đã áp dụng                 |
| Sửa dữ liệu mẫu Minh & Lan                                                             | `supabase/seed.sql`                                                                                     |
| Type sinh từ Supabase                                                                  | `packages/db-types/src/index.ts` — sinh lại bằng `supabase gen types typescript --local`, không sửa tay |
| Thêm/sửa màn hình mobile                                                               | `apps/mobile/src/app/` (Expo Router — mỗi file `.tsx` là một route)                                     |
| Component dùng chung trên mobile                                                       | `apps/mobile/src/components/`                                                                           |
| Supabase client + session storage mobile                                               | `apps/mobile/src/lib/`                                                                                  |
| Thêm/sửa trang web                                                                     | `apps/web/src/app/` (Next.js App Router)                                                                |
| Supabase client web (browser/server)                                                   | `apps/web/src/lib/supabase/`                                                                            |
| Middleware xác thực web                                                                | `apps/web/src/proxy.ts` (Next.js 16 đổi tên từ `middleware.ts`)                                         |
| CI                                                                                     | `.github/workflows/ci.yml`                                                                              |
| Đặc tả nghiệp vụ đầy đủ                                                                | `docs/SPEC.md`                                                                                          |
| Tiến độ dự án                                                                          | `docs/PROGRESS.md`                                                                                      |

## Quy tắc vị trí file (nhắc lại từ CLAUDE.md)

- Logic nghiệp vụ **chỉ** nằm trong `packages/core` — mobile/web/Edge Functions gọi lại, không viết lại công thức nơi khác.
- Mọi bảng Supabase bật RLS **ngay khi tạo** trong cùng migration — không có migration nào tạo bảng mà thiếu RLS.
- Giao dịch + allocations (hay bất kỳ thao tác nhiều bảng cần đúng tất cả-hoặc-không-gì) phải gộp trong **một** RPC Postgres — xem `create_asset` trong `supabase/migrations/20260924000007_assets.sql` làm mẫu. PostgREST **không** giữ transaction giữa hai HTTP request riêng biệt.
- Mọi chuỗi hiển thị nằm trong file ngôn ngữ, không hard-code trong component.

## Cây thư mục

<!-- STRUCTURE:AUTO:START -->

```
App QLCT/
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── mobile/
│   │   ├── assets/
│   │   │   ├── expo.icon/
│   │   │   │   ├── Assets/
│   │   │   │   │   ├── expo-symbol 2.svg
│   │   │   │   │   └── grid.png
│   │   │   │   └── icon.json
│   │   │   └── images/
│   │   │       ├── tabIcons/
│   │   │       │   ├── explore.png
│   │   │       │   ├── explore@2x.png
│   │   │       │   ├── explore@3x.png
│   │   │       │   ├── home.png
│   │   │       │   ├── home@2x.png
│   │   │       │   └── home@3x.png
│   │   │       ├── android-icon-background.png
│   │   │       ├── android-icon-foreground.png
│   │   │       ├── android-icon-monochrome.png
│   │   │       ├── expo-badge-white.png
│   │   │       ├── expo-badge.png
│   │   │       ├── expo-logo.png
│   │   │       ├── favicon.png
│   │   │       ├── icon.png
│   │   │       ├── logo-glow.png
│   │   │       ├── react-logo.png
│   │   │       ├── react-logo@2x.png
│   │   │       └── … (+3 mục khác)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── login.tsx
│   │   │   ├── components/
│   │   │   │   ├── themed-text.tsx
│   │   │   │   └── themed-view.tsx
│   │   │   ├── constants/
│   │   │   │   └── theme.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-color-scheme.ts
│   │   │   │   ├── use-color-scheme.web.ts
│   │   │   │   ├── use-session.ts
│   │   │   │   └── use-theme.ts
│   │   │   ├── lib/
│   │   │   │   ├── large-secure-store.ts
│   │   │   │   └── supabase.ts
│   │   │   └── global.css
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── AGENTS.md
│   │   ├── app.json
│   │   ├── CLAUDE.md
│   │   ├── expo-env.d.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── auth/
│       │   │   │   └── callback/
│       │   │   │       └── route.ts
│       │   │   ├── dang-nhap/
│       │   │   │   ├── page.module.css
│       │   │   │   └── page.tsx
│       │   │   ├── favicon.ico
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   ├── page.module.css
│       │   │   ├── page.tsx
│       │   │   └── sign-out-button.tsx
│       │   ├── lib/
│       │   │   └── supabase/
│       │   │       ├── client.ts
│       │   │       └── server.ts
│       │   └── proxy.ts
│       ├── .env.example
│       ├── .env.local
│       ├── .gitignore
│       ├── AGENTS.md
│       ├── CLAUDE.md
│       ├── eslint.config.mjs
│       ├── next-env.d.ts
│       ├── next.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── … (+1 mục khác)
├── docs/
│   ├── SPEC.md
│   └── STRUCTURE.md
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── allocations/
│   │   │   │   ├── allocations.test.ts
│   │   │   │   └── allocations.ts
│   │   │   ├── assets/
│   │   │   │   ├── assets.test.ts
│   │   │   │   └── assets.ts
│   │   │   ├── balance/
│   │   │   │   ├── balance.test.ts
│   │   │   │   └── balance.ts
│   │   │   ├── fund/
│   │   │   │   ├── fund.test.ts
│   │   │   │   └── fund.ts
│   │   │   ├── goals/
│   │   │   │   ├── goals.test.ts
│   │   │   │   └── goals.ts
│   │   │   ├── money/
│   │   │   │   ├── money.test.ts
│   │   │   │   └── money.ts
│   │   │   ├── net-worth/
│   │   │   │   ├── net-worth.test.ts
│   │   │   │   └── net-worth.ts
│   │   │   ├── reports/
│   │   │   │   ├── reports.test.ts
│   │   │   │   └── reports.ts
│   │   │   ├── split/
│   │   │   │   ├── split.test.ts
│   │   │   │   └── split.ts
│   │   │   ├── golden.test.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   ├── db-types/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── tokens/
│       ├── src/
│       │   ├── colors.ts
│       │   ├── index.ts
│       │   ├── layout.ts
│       │   └── typography.ts
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   └── generate-structure.js
├── supabase/
│   ├── functions/
│   │   └── .gitkeep
│   ├── migrations/
│   │   ├── 20260924000001_extensions_and_helpers.sql
│   │   ├── 20260924000002_profiles.sql
│   │   ├── 20260924000003_spaces.sql
│   │   ├── 20260924000004_wallets_categories.sql
│   │   ├── 20260924000005_transactions.sql
│   │   ├── 20260924000006_budgets_settlements.sql
│   │   ├── 20260924000007_assets.sql
│   │   ├── 20260924000008_goals.sql
│   │   ├── 20260924000009_prices_snapshots.sql
│   │   └── 20260924000010_partner_asset_summary.sql
│   ├── snippets/
│   ├── .gitignore
│   ├── config.toml
│   └── seed.sql
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── CLAUDE.md
├── eslint.config.mjs
├── package.json
└── … (+5 mục khác)
```

_Sinh tự động lúc 2026-09-24T09:48:56.442Z bởi `pnpm docs:structure`. Không sửa tay đoạn này — sửa xong sẽ bị ghi đè ở lần chạy kế tiếp._
<!-- STRUCTURE:AUTO:END -->
