import { describe, expect, it } from "vitest";
import { personalNetWorth, sharedNetWorth } from "./net-worth";

describe("net-worth", () => {
  it("golden SPEC mục 9: tài sản ròng Minh = 307.160.000", () => {
    const result = personalNetWorth({
      walletBalances: [24_500_000, 1_200_000, -3_100_000],
      fundShare: 11_160_000,
      assetShares: [
        { value: 150_000_000, shareBps: 10_000 }, // sổ Techcombank 100%
        { value: 29_300_000, shareBps: 10_000 }, // vàng SJC 100%
        { value: 41_700_000, shareBps: 5_000 }, // nhẫn trơn 50%
        { value: 120_000_000, shareBps: 6_000 }, // sổ mua nhà 60%
      ],
      receivable: 1_250_000, // Lan đang nợ Minh
      payable: 0,
    });
    expect(result).toBe(307_160_000);
  });

  it("golden SPEC mục 9: tài sản chung của không gian = 180.300.000", () => {
    const result = sharedNetWorth({
      multiOwnerAssetValues: [41_700_000, 120_000_000],
      fundBalance: 18_600_000,
    });
    expect(result).toBe(180_300_000);
  });

  it("payable làm giảm tài sản ròng", () => {
    const result = personalNetWorth({
      walletBalances: [1_000_000],
      fundShare: 0,
      assetShares: [],
      receivable: 0,
      payable: 400_000,
    });
    expect(result).toBe(600_000);
  });
});
