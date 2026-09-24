import { subtractMoney, type Money } from "../money/money";

/**
 * Áp tỷ lệ sở hữu (basis point, 10000 = 100%) lên một giá trị tiền, làm
 * tròn tới đồng gần nhất. Dùng chung cho tài sản ròng (4.7) và mục tiêu (6).
 */
export function applyShareBps(value: Money, shareBps: number): Money {
  return Math.round((value * shareBps) / 10_000);
}

/** Giá trị vàng = gram × giá mua vào mỗi gram, làm tròn tới đồng (SPEC.md mục 4.6). */
export function goldValue(grams: number, pricePerGram: Money): Money {
  return Math.round(grams * pricePerGram);
}

/** Lãi/lỗ vàng = giá trị hiện tại − giá mua. */
export function goldGainLoss(currentValue: Money, purchasePrice: Money): Money {
  return subtractMoney(currentValue, purchasePrice);
}

/**
 * Lãi dự kiến khi đáo hạn = gốc × lãi suất(bps/năm) × số ngày kỳ hạn / 365,
 * lãi đơn, chỉ hiển thị (SPEC.md mục 4.6). rateBps: basis point/năm.
 */
export function savingsExpectedInterest(
  principal: Money,
  rateBps: number,
  termDays: number,
): Money {
  return Math.round((principal * rateBps * termDays) / (10_000 * 365));
}

/** Giá trị ngoại tệ = số lượng (đơn vị nhỏ nhất) × tỷ giá mua vào mới nhất. */
export function fxValue(amountMinorUnits: number, buyRate: number): Money {
  return Math.round(amountMinorUnits * buyRate);
}
