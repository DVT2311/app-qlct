import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, formatMoneyCompact, subtractMoney, sumMoney } from "./money";

describe("money", () => {
  it("addMoney cộng hai số nguyên", () => {
    expect(addMoney(1_000, 2_000)).toBe(3_000);
  });

  it("subtractMoney trừ hai số nguyên", () => {
    expect(subtractMoney(5_000, 2_000)).toBe(3_000);
  });

  it("từ chối số thực", () => {
    expect(() => addMoney(1.5, 1)).toThrow(RangeError);
  });

  it("sumMoney cộng danh sách", () => {
    expect(sumMoney([100, 200, 300])).toBe(600);
  });

  it("formatMoney theo định dạng Việt Nam", () => {
    expect(formatMoney(1_250_000)).toBe("1.250.000 ₫");
    expect(formatMoney(-1_250_000)).toBe("-1.250.000 ₫");
    expect(formatMoney(0)).toBe("0 ₫");
  });

  it("formatMoneyCompact rút gọn cho biểu đồ", () => {
    expect(formatMoneyCompact(8_420_000)).toBe("8,42 tr");
    expect(formatMoneyCompact(500)).toBe("500 ₫");
  });
});
