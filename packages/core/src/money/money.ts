/**
 * Tiền luôn là số nguyên (VND không có phần thập phân). Mọi phép tính tiền
 * trong app phải đi qua các helper ở đây — xem CLAUDE.md quy tắc 1.
 */
export type Money = number;

function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${label} phải là số nguyên, nhận được ${value}`);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertInteger(a, "a");
  assertInteger(b, "b");
  return a + b;
}

export function subtractMoney(a: Money, b: Money): Money {
  assertInteger(a, "a");
  assertInteger(b, "b");
  return a - b;
}

export function sumMoney(values: readonly Money[]): Money {
  return values.reduce((total, value) => addMoney(total, value), 0);
}

/** Định dạng tiền kiểu Việt Nam: 1.250.000 ₫ (SPEC mục 8.1 / CLAUDE.md quy tắc 10). */
export function formatMoney(amount: Money): string {
  assertInteger(amount, "amount");
  const formatted = new Intl.NumberFormat("vi-VN").format(Math.abs(amount));
  const sign = amount < 0 ? "-" : "";
  return `${sign}${formatted} ₫`;
}

const COMPACT_UNITS: ReadonlyArray<{ threshold: number; divisor: number; suffix: string }> = [
  { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: "tỷ" },
  { threshold: 1_000_000, divisor: 1_000_000, suffix: "tr" },
  { threshold: 1_000, divisor: 1_000, suffix: "k" },
];

/** Rút gọn để dùng trong biểu đồ, ví dụ 8,42 tr — không dùng cho số liệu kế toán. */
export function formatMoneyCompact(amount: Money): string {
  assertInteger(amount, "amount");
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const unit = COMPACT_UNITS.find((u) => abs >= u.threshold);
  if (!unit) {
    return `${sign}${new Intl.NumberFormat("vi-VN").format(abs)} ₫`;
  }
  const value = abs / unit.divisor;
  const rounded = Math.round(value * 100) / 100;
  return `${sign}${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(rounded)} ${unit.suffix}`;
}
