import { subtractMoney, sumMoney, type Money } from "../money/money";

/**
 * Phần của U trong quỹ chung = Σ contribution của U − Σ phân bổ cho U của
 * các expense trả từ quỹ (SPEC.md mục 4.5).
 */
export function fundShare(
  contributions: readonly Money[],
  fundExpenseAllocations: readonly Money[],
): Money {
  return subtractMoney(sumMoney(contributions), sumMoney(fundExpenseAllocations));
}

/**
 * Tỷ lệ sở hữu quỹ hiển thị = phần của U / số dư quỹ, trả về basis point
 * (10000 = 100%). Trả về 0 nếu quỹ trống để tránh chia cho 0.
 */
export function fundOwnershipBps(userFundShare: Money, fundBalance: Money): number {
  if (fundBalance === 0) {
    return 0;
  }
  return Math.round((userFundShare * 10_000) / fundBalance);
}
