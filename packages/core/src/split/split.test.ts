import { describe, expect, it } from "vitest";
import { computeSplit } from "./split";

const MINH = "minh";
const LAN = "lan";

describe("computeSplit", () => {
  it("even: chia đều, phần dư về người trả (1.000.001)", () => {
    const result = computeSplit({
      amount: 1_000_001,
      mode: "even",
      payerId: MINH,
      members: [{ userId: MINH }, { userId: LAN }],
    });
    expect(result).toEqual([
      { userId: MINH, amount: 500_001 },
      { userId: LAN, amount: 500_000 },
    ]);
  });

  it("even: vé xem phim 350.000, Lan trả", () => {
    const result = computeSplit({
      amount: 350_000,
      mode: "even",
      payerId: LAN,
      members: [{ userId: MINH }, { userId: LAN }],
    });
    expect(result).toEqual([
      { userId: MINH, amount: 175_000 },
      { userId: LAN, amount: 175_000 },
    ]);
  });

  it("ratio: tiền nhà 7.000.000 chia 60/40, Minh trả", () => {
    const result = computeSplit({
      amount: 7_000_000,
      mode: "ratio",
      payerId: MINH,
      members: [
        { userId: MINH, ratioBps: 6000 },
        { userId: LAN, ratioBps: 4000 },
      ],
    });
    expect(result).toEqual([
      { userId: MINH, amount: 4_200_000 },
      { userId: LAN, amount: 2_800_000 },
    ]);
  });

  it("ratio: thiếu ratioBps thì báo lỗi", () => {
    expect(() =>
      computeSplit({
        amount: 100_000,
        mode: "ratio",
        payerId: MINH,
        members: [{ userId: MINH }, { userId: LAN, ratioBps: 10_000 }],
      }),
    ).toThrow(RangeError);
  });

  it("custom: tổng phải khớp amount", () => {
    const result = computeSplit({
      amount: 100_000,
      mode: "custom",
      payerId: MINH,
      members: [
        { userId: MINH, amount: 60_000 },
        { userId: LAN, amount: 40_000 },
      ],
    });
    expect(result).toEqual([
      { userId: MINH, amount: 60_000 },
      { userId: LAN, amount: 40_000 },
    ]);
  });

  it("custom: thiếu amount thì báo lỗi", () => {
    expect(() =>
      computeSplit({
        amount: 100_000,
        mode: "custom",
        payerId: MINH,
        members: [{ userId: MINH, amount: 60_000 }, { userId: LAN }],
      }),
    ).toThrow(RangeError);
  });

  it("custom: tổng sai thì báo lỗi", () => {
    expect(() =>
      computeSplit({
        amount: 100_000,
        mode: "custom",
        payerId: MINH,
        members: [
          { userId: MINH, amount: 60_000 },
          { userId: LAN, amount: 30_000 },
        ],
      }),
    ).toThrow(RangeError);
  });

  it("payer_all: 100% cho người trả", () => {
    const result = computeSplit({
      amount: 500_000,
      mode: "payer_all",
      payerId: LAN,
      members: [{ userId: MINH }, { userId: LAN }],
    });
    expect(result).toEqual([
      { userId: MINH, amount: 0 },
      { userId: LAN, amount: 500_000 },
    ]);
  });

  it("báo lỗi khi payerId không có trong members", () => {
    expect(() =>
      computeSplit({
        amount: 100_000,
        mode: "payer_all",
        payerId: "unknown",
        members: [{ userId: MINH }, { userId: LAN }],
      }),
    ).toThrow(RangeError);
  });

  it("báo lỗi khi members rỗng", () => {
    expect(() =>
      computeSplit({ amount: 100_000, mode: "even", payerId: MINH, members: [] }),
    ).toThrow(RangeError);
  });
});
