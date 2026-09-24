import { sumMoney, type Money } from "../money/money";

/**
 * Chi tiêu cá nhân của U trong kỳ = Σ phân bổ cho U của các expense trong kỳ
 * (cả riêng lẫn chung, kể cả chi từ quỹ chung). SPEC.md mục 4.3.
 */
export function personalExpenseTotal(allocationsForUser: readonly Money[]): Money {
  return sumMoney(allocationsForUser);
}

/**
 * Chi tiêu chung của không gian = Σ amount các expense có space_id = không
 * gian đó. transfer/contribution/settlement không bao giờ tính vào đây.
 * SPEC.md mục 4.3.
 */
export function sharedExpenseTotal(spaceExpenseAmounts: readonly Money[]): Money {
  return sumMoney(spaceExpenseAmounts);
}
