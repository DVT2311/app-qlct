import { describe, expect, it } from "vitest";
import { applyShareBps, fxValue, goldGainLoss, goldValue, savingsExpectedInterest } from "./assets";

describe("assets", () => {
  it("applyShareBps: áp tỷ lệ sở hữu", () => {
    expect(applyShareBps(41_700_000, 5_000)).toBe(20_850_000); // nhẫn trơn 50%
    expect(applyShareBps(120_000_000, 6_000)).toBe(72_000_000); // sổ mua nhà 60%
    expect(applyShareBps(120_000_000, 4_000)).toBe(48_000_000); // sổ mua nhà 40%
  });

  it("goldValue: gram × giá mỗi gram, làm tròn", () => {
    expect(goldValue(10, 7_000_000)).toBe(70_000_000);
    expect(goldValue(7.5, 3_906_666.666)).toBe(29_300_000); // làm tròn tới đồng
  });

  it("golden SPEC mục 9: lãi vàng SJC = 2.900.000", () => {
    expect(goldGainLoss(29_300_000, 26_400_000)).toBe(2_900_000);
  });

  it("golden SPEC mục 9: lãi dự kiến sổ Techcombank = 7.500.000", () => {
    // gốc 150tr, 5%/năm (500 bps), kỳ hạn 365 ngày
    expect(savingsExpectedInterest(150_000_000, 500, 365)).toBe(7_500_000);
  });

  it("savingsExpectedInterest: kỳ hạn ngắn hơn 1 năm", () => {
    expect(savingsExpectedInterest(100_000_000, 600, 182)).toBe(2_991_781); // ~6 tháng, 6%/năm
  });

  it("fxValue: số lượng × tỷ giá mua vào", () => {
    expect(fxValue(1_000, 25_450)).toBe(25_450_000);
  });
});
