import { addMoney, subtractMoney, sumMoney, type Money } from "../money/money";
import { applyShareBps } from "../assets/assets";

export interface AssetShare {
  /** Giá trị hiện tại của toàn bộ tài sản (không nhân tỷ lệ sở hữu). */
  value: Money;
  /** Tỷ lệ sở hữu của người dùng đang tính (basis point). */
  shareBps: number;
}

export interface PersonalNetWorthInput {
  /** Số dư mọi ví cá nhân, thẻ tín dụng là số âm. */
  walletBalances: readonly Money[];
  /** Phần của người dùng trong quỹ chung (SPEC.md mục 4.5). */
  fundShare: Money;
  /** Tài sản (riêng và chung) kèm tỷ lệ sở hữu của người dùng. */
  assetShares: readonly AssetShare[];
  /** Khoản người kia đang nợ người dùng. */
  receivable: Money;
  /** Khoản người dùng đang nợ người kia. */
  payable: Money;
}

/**
 * Tài sản ròng cá nhân của U (SPEC.md mục 4.7) =
 * Σ số dư ví cá nhân + phần trong quỹ chung + Σ(giá trị tài sản × share)
 * + khoản người kia đang nợ U − khoản U đang nợ người kia.
 */
export function personalNetWorth(input: PersonalNetWorthInput): Money {
  const walletsTotal = sumMoney(input.walletBalances);
  const assetsTotal = sumMoney(input.assetShares.map((a) => applyShareBps(a.value, a.shareBps)));
  const withReceivable = addMoney(
    addMoney(addMoney(walletsTotal, input.fundShare), assetsTotal),
    input.receivable,
  );
  return subtractMoney(withReceivable, input.payable);
}

export interface SharedNetWorthInput {
  /** Giá trị đầy đủ (không chia tỷ lệ) của các tài sản có ≥2 chủ sở hữu thuộc không gian. */
  multiOwnerAssetValues: readonly Money[];
  /** Số dư ví quỹ chung. */
  fundBalance: Money;
}

/**
 * Tài sản ròng chung của không gian (SPEC.md mục 4.7) =
 * Σ giá trị tài sản có ≥2 chủ sở hữu + số dư quỹ chung.
 */
export function sharedNetWorth(input: SharedNetWorthInput): Money {
  return addMoney(sumMoney(input.multiOwnerAssetValues), input.fundBalance);
}
