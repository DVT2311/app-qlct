import { addMoney, subtractMoney, type Money } from "../money/money";
import type { SplitMode } from "../split/split";
import type { TransactionAllocation } from "../allocations/allocations";

/** Một giao dịch chi tiêu chung ảnh hưởng tới số dư nợ (SPEC.md mục 4.4). */
export interface ExpenseBalanceEvent {
  type: "expense";
  /** Người trả từ ví cá nhân. Bỏ trống nếu trả từ ví quỹ chung. */
  paidBy?: string;
  /** true nếu giao dịch trả từ ví quỹ chung (shared_fund) — không ảnh hưởng nợ. */
  paidFromSharedFund: boolean;
  splitMode: SplitMode;
  allocations: readonly TransactionAllocation[];
}

/** Một lần ghi nhận thanh toán nợ (SPEC.md mục 4.4). */
export interface SettlementBalanceEvent {
  type: "settlement";
  paidBy: string;
  paidTo: string;
  amount: Money;
}

export type BalanceEvent = ExpenseBalanceEvent | SettlementBalanceEvent;

function allocationFor(allocations: readonly TransactionAllocation[], userId: string): Money {
  return allocations.find((a) => a.userId === userId)?.amount ?? 0;
}

/**
 * balance(personA → personB) = số tiền personB đang nợ personA.
 * Dương: B nợ A. Âm: A nợ B. Chỉ áp dụng cho không gian 2 thành viên (MVP).
 * Xem SPEC.md mục 4.4.
 */
export function balanceBetween(
  events: readonly BalanceEvent[],
  personA: string,
  personB: string,
): Money {
  let balance: Money = 0;

  for (const event of events) {
    if (event.type === "expense") {
      if (event.paidFromSharedFund || event.splitMode === "payer_all") {
        continue;
      }
      if (event.paidBy === personA) {
        balance = addMoney(balance, allocationFor(event.allocations, personB));
      } else if (event.paidBy === personB) {
        balance = subtractMoney(balance, allocationFor(event.allocations, personA));
      }
    } else {
      if (event.paidBy === personA && event.paidTo === personB) {
        balance = addMoney(balance, event.amount);
      } else if (event.paidBy === personB && event.paidTo === personA) {
        balance = subtractMoney(balance, event.amount);
      }
    }
  }

  return balance;
}
