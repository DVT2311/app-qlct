import { describe, expect, it } from "vitest";
import {
  goalCurrentAmount,
  goalMemberContribution,
  goalProgressBps,
  suggestedMonthlyContribution,
} from "./goals";

describe("goals", () => {
  it("golden SPEC mục 9: quỹ cưới hiện có 60.300.000 (quỹ chung + nhẫn trơn)", () => {
    expect(goalCurrentAmount([18_600_000, 41_700_000], [])).toBe(60_300_000);
  });

  it("golden SPEC mục 9: quỹ mua nhà hiện có 120.000.000", () => {
    expect(goalCurrentAmount([120_000_000], [])).toBe(120_000_000);
  });

  it("golden SPEC mục 9: quỹ cưới đạt 24% (2412 bps)", () => {
    expect(goalProgressBps(60_300_000, 250_000_000)).toBe(2_412);
  });

  it("golden SPEC mục 9: quỹ mua nhà đạt 20%", () => {
    expect(goalProgressBps(120_000_000, 600_000_000)).toBe(2_000);
  });

  it("goalProgressBps: target = 0 trả về 0", () => {
    expect(goalProgressBps(0, 0)).toBe(0);
  });

  it("golden SPEC mục 9: phần góp của Minh vào quỹ cưới = 32.010.000", () => {
    // quỹ chung: phần của Minh 11.160.000 (100%); nhẫn trơn: Minh sở hữu 50%
    const result = goalMemberContribution(
      [
        { value: 11_160_000, shareBps: 10_000 },
        { value: 41_700_000, shareBps: 5_000 },
      ],
      [],
    );
    expect(result).toBe(32_010_000);
  });

  it("golden SPEC mục 9: phần góp của Lan vào quỹ cưới = 28.290.000", () => {
    const result = goalMemberContribution(
      [
        { value: 7_440_000, shareBps: 10_000 },
        { value: 41_700_000, shareBps: 5_000 },
      ],
      [],
    );
    expect(result).toBe(28_290_000);
  });

  it("suggestedMonthlyContribution: chia hết", () => {
    expect(suggestedMonthlyContribution(12_000_000, 2_000_000, 5)).toBe(2_000_000);
  });

  it("suggestedMonthlyContribution: làm tròn lên hàng nghìn", () => {
    expect(suggestedMonthlyContribution(10_000_001, 0, 3)).toBe(3_334_000);
  });

  it("suggestedMonthlyContribution: đã đạt mục tiêu trả về 0", () => {
    expect(suggestedMonthlyContribution(10_000_000, 10_000_000, 6)).toBe(0);
    expect(suggestedMonthlyContribution(10_000_000, 12_000_000, 6)).toBe(0);
  });

  it("suggestedMonthlyContribution: từ chối monthsRemaining không hợp lệ", () => {
    expect(() => suggestedMonthlyContribution(10_000_000, 0, 0)).toThrow(RangeError);
  });
});
