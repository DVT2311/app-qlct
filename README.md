# Sổ Đôi

Ứng dụng quản lý tài chính cá nhân cho cặp đôi trước hôn nhân. Xem [`CLAUDE.md`](./CLAUDE.md) để biết quy tắc bắt buộc và [`docs/SPEC.md`](./docs/SPEC.md) để biết đặc tả đầy đủ.

## Cấu trúc

```
apps/mobile        # Expo app (React Native + Expo Router)
apps/web            # Next.js dashboard
packages/core       # logic nghiệp vụ thuần TypeScript + test (Vitest)
packages/tokens     # design tokens dùng chung
packages/db-types    # type sinh từ Supabase
supabase/migrations  # migrations SQL
supabase/functions   # Edge Functions
supabase/seed.sql    # dữ liệu mẫu Minh & Lan
docs/SPEC.md
```

## Bắt đầu

```
pnpm install
supabase start && supabase db reset     # DB local + seed
pnpm dev                                 # chạy song song mobile + web
pnpm --filter @so-doi/core test          # test logic nghiệp vụ
pnpm lint && pnpm typecheck
supabase gen types typescript --local > packages/db-types/src/index.ts
```
