import { describe, expect, it } from "vitest";
import { personalExpenseTotal, sharedExpenseTotal } from "./reports";

describe("reports", () => {
  it("golden SPEC mục 9: chi tiêu cá nhân Minh tháng 9 = 8.420.000", () => {
    // phần chi chung của Minh (5.300.000) + chi riêng (3.120.000)
    const minhAllocations = [4_200_000, 175_000, 425_000, 500_000, 3_120_000];
    expect(personalExpenseTotal(minhAllocations)).toBe(8_420_000);
  });

  it("golden SPEC mục 9: phần chi chung của Minh = 5.300.000", () => {
    expect(personalExpenseTotal([4_200_000, 175_000, 425_000, 500_000])).toBe(5_300_000);
  });

  it("golden SPEC mục 9: tổng chi tiêu chung tháng 9 = 9.200.000", () => {
    expect(sharedExpenseTotal([7_000_000, 350_000, 850_000, 1_000_000])).toBe(9_200_000);
  });
});
