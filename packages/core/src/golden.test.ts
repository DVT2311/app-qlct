import { describe, expect, it } from "vitest";
import { sharedAllocation } from "./allocations/allocations";
import { balanceBetween, type BalanceEvent } from "./balance/balance";
import { fundOwnershipBps, fundShare } from "./fund/fund";
import { goldGainLoss, savingsExpectedInterest, applyShareBps } from "./assets/assets";
import { personalNetWorth, sharedNetWorth } from "./net-worth/net-worth";
import { goalCurrentAmount, goalMemberContribution, goalProgressBps } from "./goals/goals";
import { personalExpenseTotal, sharedExpenseTotal } from "./reports/reports";
import { sumMoney } from "./money/money";

/**
 * Kịch bản dữ liệu mẫu Minh & Lan, tháng 9/2026 — SPEC.md mục 9.
 * Test này nối các module packages/core với nhau y như cách app sẽ dùng,
 * thay vì lặp lại các con số đã tính sẵn ở từng test đơn vị.
 */
describe("golden: Minh & Lan tháng 9/2026 (SPEC.md mục 9)", () => {
  const MINH = "minh";
  const LAN = "lan";

  const houseAllocation = sharedAllocation({
    amount: 7_000_000,
    mode: "ratio",
    payerId: MINH,
    members: [
      { userId: MINH, ratioBps: 6_000 },
      { userId: LAN, ratioBps: 4_000 },
    ],
  });
  const movieAllocation = sharedAllocation({
    amount: 350_000,
    mode: "even",
    payerId: LAN,
    members: [{ userId: MINH }, { userId: LAN }],
  });
  const electricityAllocation = sharedAllocation({
    amount: 850_000,
    mode: "even",
    payerId: LAN,
    members: [{ userId: MINH }, { userId: LAN }],
  });
  const dinnerAllocation = sharedAllocation({
    amount: 1_000_000,
    mode: "even",
    payerId: MINH,
    members: [{ userId: MINH }, { userId: LAN }],
  });

  const balanceEvents: BalanceEvent[] = [
    {
      type: "expense",
      paidBy: MINH,
      paidFromSharedFund: false,
      splitMode: "ratio",
      allocations: houseAllocation,
    },
    { type: "settlement", paidBy: LAN, paidTo: MINH, amount: 1_450_000 },
    {
      type: "expense",
      paidBy: LAN,
      paidFromSharedFund: false,
      splitMode: "even",
      allocations: movieAllocation,
    },
    {
      type: "expense",
      paidBy: LAN,
      paidFromSharedFund: false,
      splitMode: "even",
      allocations: electricityAllocation,
    },
    {
      type: "expense",
      paidBy: MINH,
      paidFromSharedFund: false,
      splitMode: "even",
      allocations: dinnerAllocation,
    },
  ];

  it("balance(Minh→Lan) = 1.250.000 (Lan nợ Minh)", () => {
    expect(balanceBetween(balanceEvents, MINH, LAN)).toBe(1_250_000);
  });

  it("tổng chi tiêu chung tháng 9 = 9.200.000; Minh trả 8.000.000, Lan trả 1.200.000", () => {
    expect(sharedExpenseTotal([7_000_000, 350_000, 850_000, 1_000_000])).toBe(9_200_000);
    expect(sumMoney([7_000_000, 1_000_000])).toBe(8_000_000); // Minh trả
    expect(sumMoney([350_000, 850_000])).toBe(1_200_000); // Lan trả
  });

  it("phần chi chung của Minh = 5.300.000; chi tiêu cá nhân tháng 9 = 8.420.000", () => {
    const minhShareOfShared = [
      houseAllocation,
      movieAllocation,
      electricityAllocation,
      dinnerAllocation,
    ].map((allocations) => allocations.find((a) => a.userId === MINH)!.amount);
    expect(personalExpenseTotal(minhShareOfShared)).toBe(5_300_000);
    expect(personalExpenseTotal([...minhShareOfShared, 3_120_000])).toBe(8_420_000);
  });

  it("quỹ chung: Minh 11.160.000 (60%), Lan 7.440.000 (40%), số dư 18.600.000", () => {
    const minhFundShare = fundShare([11_160_000], []);
    const lanFundShare = fundShare([7_440_000], []);
    const fundBalance = sumMoney([minhFundShare, lanFundShare]);
    expect(fundBalance).toBe(18_600_000);
    expect(fundOwnershipBps(minhFundShare, fundBalance)).toBe(6_000);
    expect(fundOwnershipBps(lanFundShare, fundBalance)).toBe(4_000);
  });

  it("tài sản ròng Minh = 307.160.000", () => {
    const minhFundShare = fundShare([11_160_000], []);
    const receivable = balanceBetween(balanceEvents, MINH, LAN); // Lan nợ Minh
    const netWorth = personalNetWorth({
      walletBalances: [24_500_000, 1_200_000, -3_100_000],
      fundShare: minhFundShare,
      assetShares: [
        { value: 150_000_000, shareBps: 10_000 },
        { value: 29_300_000, shareBps: 10_000 },
        { value: 41_700_000, shareBps: 5_000 },
        { value: 120_000_000, shareBps: 6_000 },
      ],
      receivable,
      payable: 0,
    });
    expect(netWorth).toBe(307_160_000);
  });

  it("tài sản chung của không gian = 180.300.000", () => {
    expect(
      sharedNetWorth({ multiOwnerAssetValues: [41_700_000, 120_000_000], fundBalance: 18_600_000 }),
    ).toBe(180_300_000);
  });

  it("lãi vàng SJC = 2.900.000; lãi dự kiến sổ Techcombank = 7.500.000", () => {
    expect(goldGainLoss(29_300_000, 26_400_000)).toBe(2_900_000);
    expect(savingsExpectedInterest(150_000_000, 500, 365)).toBe(7_500_000);
  });

  it("quỹ cưới: hiện có 60.300.000 (24%), Minh góp 32.010.000, Lan góp 28.290.000", () => {
    const current = goalCurrentAmount([18_600_000, 41_700_000], []);
    expect(current).toBe(60_300_000);
    expect(goalProgressBps(current, 250_000_000)).toBe(2_412);

    const minhFundShare = fundShare([11_160_000], []);
    const lanFundShare = fundShare([7_440_000], []);
    expect(
      goalMemberContribution(
        [
          { value: minhFundShare, shareBps: 10_000 },
          { value: 41_700_000, shareBps: 5_000 },
        ],
        [],
      ),
    ).toBe(32_010_000);
    expect(
      goalMemberContribution(
        [
          { value: lanFundShare, shareBps: 10_000 },
          { value: 41_700_000, shareBps: 5_000 },
        ],
        [],
      ),
    ).toBe(28_290_000);
  });

  it("quỹ mua nhà: hiện có 120.000.000 (20%)", () => {
    const current = goalCurrentAmount([120_000_000], []);
    expect(current).toBe(120_000_000);
    expect(goalProgressBps(current, 600_000_000)).toBe(2_000);
    expect(applyShareBps(120_000_000, 6_000)).toBe(72_000_000); // phần Minh 60%
    expect(applyShareBps(120_000_000, 4_000)).toBe(48_000_000); // phần Lan 40%
  });
});
