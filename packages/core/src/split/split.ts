import { divideMoneyByWeights, divideMoneyEvenly, sumMoney, type Money } from "../money/money";

/** SPEC.md mục 4.2 */
export type SplitMode = "even" | "ratio" | "custom" | "payer_all";

export interface SplitMember {
  userId: string;
  /** Bắt buộc khi mode = 'ratio'. */
  ratioBps?: number;
  /** Bắt buộc khi mode = 'custom'. */
  amount?: Money;
}

export interface SplitInput {
  amount: Money;
  mode: SplitMode;
  payerId: string;
  members: readonly SplitMember[];
}

export interface SplitAllocation {
  userId: string;
  amount: Money;
}

function findPayerIndex(members: readonly SplitMember[], payerId: string): number {
  const index = members.findIndex((m) => m.userId === payerId);
  if (index === -1) {
    throw new RangeError(`payerId "${payerId}" không có trong danh sách members`);
  }
  return index;
}

/** Tính phân bổ cho một giao dịch chung theo kiểu chia. Hàm tất định. */
export function computeSplit(input: SplitInput): SplitAllocation[] {
  const { amount, mode, payerId, members } = input;
  if (members.length === 0) {
    throw new RangeError("members không được rỗng");
  }
  const payerIndex = findPayerIndex(members, payerId);

  switch (mode) {
    case "even": {
      const parts = divideMoneyEvenly(amount, members.length, payerIndex);
      return members.map((m, i) => ({ userId: m.userId, amount: parts[i] as Money }));
    }
    case "ratio": {
      const weights = members.map((m) => {
        if (m.ratioBps === undefined) {
          throw new RangeError(`Thiếu ratioBps cho thành viên "${m.userId}"`);
        }
        return m.ratioBps;
      });
      const parts = divideMoneyByWeights(amount, weights, payerIndex);
      return members.map((m, i) => ({ userId: m.userId, amount: parts[i] as Money }));
    }
    case "custom": {
      const parts = members.map((m) => {
        if (m.amount === undefined) {
          throw new RangeError(`Thiếu amount cho thành viên "${m.userId}"`);
        }
        return m.amount;
      });
      const total = sumMoney(parts);
      if (total !== amount) {
        throw new RangeError(
          `Tổng custom amount (${total}) phải bằng amount giao dịch (${amount})`,
        );
      }
      return members.map((m, i) => ({ userId: m.userId, amount: parts[i] as Money }));
    }
    case "payer_all": {
      return members.map((m, i) => ({ userId: m.userId, amount: i === payerIndex ? amount : 0 }));
    }
  }
}
