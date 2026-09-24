import { sumMoney, type Money } from "../money/money";
import { computeSplit, type SplitInput } from "../split/split";

/** Một dòng trong bảng transaction_allocations (SPEC.md mục 6). */
export interface TransactionAllocation {
  userId: string;
  amount: Money;
}

/** Giao dịch riêng: một dòng phân bổ 100% cho chủ giao dịch (SPEC.md mục 4.2). */
export function personalAllocation(amount: Money, ownerId: string): TransactionAllocation[] {
  return [{ userId: ownerId, amount }];
}

/** Giao dịch chung: một dòng cho mỗi thành viên theo kiểu chia. */
export function sharedAllocation(input: SplitInput): TransactionAllocation[] {
  const allocations = computeSplit(input);
  assertAllocationTotal(allocations, input.amount);
  return allocations;
}

/**
 * Tổng phân bổ phải bằng đúng amount — ràng buộc kiểm tra ở core, gương với
 * trigger DB (CLAUDE.md quy tắc 1 & 5, SPEC.md mục 4.2).
 */
export function assertAllocationTotal(
  allocations: readonly TransactionAllocation[],
  amount: Money,
): void {
  const total = sumMoney(allocations.map((a) => a.amount));
  if (total !== amount) {
    throw new RangeError(`Tổng allocation (${total}) phải bằng amount giao dịch (${amount})`);
  }
}
