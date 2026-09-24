import { describe, expect, it } from "vitest";
import {
  addMoney,
  divideMoneyByWeights,
  divideMoneyEvenly,
  formatMoney,
  formatMoneyCompact,
  subtractMoney,
  sumMoney,
} from "./money";

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

  it("divideMoneyEvenly làm tròn, phần dư về remainderIndex (SPEC mục 9)", () => {
    // 1.000.001 chia đều 2 người, người trả A (index 0): A=500.001, B=500.000
    expect(divideMoneyEvenly(1_000_001, 2, 0)).toEqual([500_001, 500_000]);
  });

  it("divideMoneyEvenly chia hết không có dư", () => {
    expect(divideMoneyEvenly(350_000, 2, 1)).toEqual([175_000, 175_000]);
  });

  it("divideMoneyEvenly từ chối count không hợp lệ", () => {
    expect(() => divideMoneyEvenly(1_000, 0)).toThrow(RangeError);
    expect(() => divideMoneyEvenly(1_000, 2, 5)).toThrow(RangeError);
  });

  it("divideMoneyByWeights chia theo tỷ lệ, phần dư về remainderIndex (SPEC mục 9)", () => {
    // 100.000 chia ratio 3333/6667 -> tổng đúng 100.000, phần dư về người trả
    expect(divideMoneyByWeights(100_000, [3333, 6667], 0)).toEqual([33_330, 66_670]);
  });

  it("divideMoneyByWeights chia tiền nhà 7.000.000 theo 60/40", () => {
    expect(divideMoneyByWeights(7_000_000, [6000, 4000], 0)).toEqual([4_200_000, 2_800_000]);
  });

  it("divideMoneyByWeights từ chối tổng bps khác 10000", () => {
    expect(() => divideMoneyByWeights(1_000, [3000, 6000])).toThrow(RangeError);
  });

  it("divideMoneyByWeights từ chối weightsBps rỗng", () => {
    expect(() => divideMoneyByWeights(1_000, [])).toThrow(RangeError);
  });

  it("divideMoneyByWeights từ chối remainderIndex ngoài phạm vi", () => {
    expect(() => divideMoneyByWeights(1_000, [5000, 5000], 5)).toThrow(RangeError);
  });
});
