import { describe, expect, it } from "vitest";
import { assertAllocationTotal, personalAllocation, sharedAllocation } from "./allocations";

const MINH = "minh";
const LAN = "lan";

describe("allocations", () => {
  it("personalAllocation: 100% cho chủ giao dịch", () => {
    expect(personalAllocation(3_120_000, MINH)).toEqual([{ userId: MINH, amount: 3_120_000 }]);
  });

  it("sharedAllocation: dùng computeSplit và validate tổng", () => {
    const result = sharedAllocation({
      amount: 1_000_000,
      mode: "even",
      payerId: MINH,
      members: [{ userId: MINH }, { userId: LAN }],
    });
    expect(result).toEqual([
      { userId: MINH, amount: 500_000 },
      { userId: LAN, amount: 500_000 },
    ]);
  });

  it("assertAllocationTotal: không báo lỗi khi tổng khớp", () => {
    expect(() =>
      assertAllocationTotal(
        [
          { userId: MINH, amount: 500_000 },
          { userId: LAN, amount: 500_000 },
        ],
        1_000_000,
      ),
    ).not.toThrow();
  });

  it("assertAllocationTotal: báo lỗi khi tổng lệch", () => {
    expect(() => assertAllocationTotal([{ userId: MINH, amount: 900_000 }], 1_000_000)).toThrow(
      RangeError,
    );
  });
});
