// File này được sinh tự động bằng lệnh:
//   pnpm --filter @so-doi/db-types generate
// (tương đương: supabase gen types typescript --local > packages/db-types/src/index.ts)
// Chưa chạy migration nên chưa có type thật — placeholder để các package khác import được.
export type Database = Record<string, never>;
