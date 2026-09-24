import { describe, expect, it } from "vitest";
import { fundOwnershipBps, fundShare } from "./fund";

describe("fund", () => {
  it("golden SPEC mục 9: quỹ chung Minh 11.160.000 / Lan 7.440.000", () => {
    expect(fundShare([11_160_000], [])).toBe(11_160_000);
    expect(fundShare([7_440_000], [])).toBe(7_440_000);
  });

  it("trừ đi phần chi từ quỹ", () => {
    expect(fundShare([10_000_000], [2_000_000, 500_000])).toBe(7_500_000);
  });

  it("fundOwnershipBps: tỷ lệ sở hữu quỹ", () => {
    // Minh 11.160.000 / 18.600.000 = 60%
    expect(fundOwnershipBps(11_160_000, 18_600_000)).toBe(6_000);
    // Lan 7.440.000 / 18.600.000 = 40%
    expect(fundOwnershipBps(7_440_000, 18_600_000)).toBe(4_000);
  });

  it("fundOwnershipBps: quỹ trống trả về 0", () => {
    expect(fundOwnershipBps(0, 0)).toBe(0);
  });
});
