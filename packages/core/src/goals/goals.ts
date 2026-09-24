import { addMoney, sumMoney, type Money } from "../money/money";
import { applyShareBps } from "../assets/assets";
import type { AssetShare } from "../net-worth/net-worth";

/**
 * Tiến độ mục tiêu (SPEC.md mục 6) =
 * Σ giá trị tài sản/ví liên kết (goal_links) + Σ goal_contributions không
 * gắn với tài sản liên kết.
 */
export function goalCurrentAmount(
  linkedValues: readonly Money[],
  unlinkedContributions: readonly Money[],
): Money {
  return addMoney(sumMoney(linkedValues), sumMoney(unlinkedContributions));
}

/** Tiến độ mục tiêu dạng basis point (10000 = 100%), có thể vượt 10000 nếu đã đạt/vượt mục tiêu. */
export function goalProgressBps(current: Money, target: Money): number {
  if (target === 0) {
    return 0;
  }
  return Math.round((current * 10_000) / target);
}

/**
 * Phần góp của một người vào mục tiêu = theo tỷ lệ sở hữu của tài sản/ví
 * liên kết + contributions trực tiếp của người đó (SPEC.md mục 6).
 * Với ví quỹ chung, truyền vào AssetShare có value = phần quỹ của người đó
 * và shareBps = 10000 (đã quy về giá trị cá nhân từ trước).
 */
export function goalMemberContribution(
  linkedAssetShares: readonly AssetShare[],
  directContributions: readonly Money[],
): Money {
  const fromAssets = sumMoney(linkedAssetShares.map((a) => applyShareBps(a.value, a.shareBps)));
  return addMoney(fromAssets, sumMoney(directContributions));
}

/**
 * Gợi ý góp mỗi tháng = (mục tiêu − hiện có) / số tháng còn lại, làm tròn
 * lên hàng nghìn (SPEC.md mục 8.2). Trả về 0 nếu đã đạt/vượt mục tiêu.
 */
export function suggestedMonthlyContribution(
  target: Money,
  current: Money,
  monthsRemaining: number,
): Money {
  if (!Number.isInteger(monthsRemaining) || monthsRemaining <= 0) {
    throw new RangeError(`monthsRemaining phải là số nguyên dương, nhận được ${monthsRemaining}`);
  }
  const remaining = target - current;
  if (remaining <= 0) {
    return 0;
  }
  const perMonth = remaining / monthsRemaining;
  return Math.ceil(perMonth / 1_000) * 1_000;
}
