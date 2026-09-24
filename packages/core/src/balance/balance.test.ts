import { describe, expect, it } from "vitest";
import { balanceBetween, type BalanceEvent } from "./balance";

const MINH = "minh";
const LAN = "lan";

// SPEC.md mục 9 — 5 giao dịch chung tháng 9/2026
const seedEvents: BalanceEvent[] = [
  {
    type: "expense",
    paidBy: MINH,
    paidFromSharedFund: false,
    splitMode: "ratio",
    allocations: [
      { userId: MINH, amount: 4_200_000 },
      { userId: LAN, amount: 2_800_000 },
    ],
  },
  { type: "settlement", paidBy: LAN, paidTo: MINH, amount: 1_450_000 },
  {
    type: "expense",
    paidBy: LAN,
    paidFromSharedFund: false,
    splitMode: "even",
    allocations: [
      { userId: MINH, amount: 175_000 },
      { userId: LAN, amount: 175_000 },
    ],
  },
  {
    type: "expense",
    paidBy: LAN,
    paidFromSharedFund: false,
    splitMode: "even",
    allocations: [
      { userId: MINH, amount: 425_000 },
      { userId: LAN, amount: 425_000 },
    ],
  },
  {
    type: "expense",
    paidBy: MINH,
    paidFromSharedFund: false,
    splitMode: "even",
    allocations: [
      { userId: MINH, amount: 500_000 },
      { userId: LAN, amount: 500_000 },
    ],
  },
];

describe("balanceBetween", () => {
  it("golden SPEC mục 9: balance(Minh→Lan) = 1.250.000 (Lan nợ Minh)", () => {
    expect(balanceBetween(seedEvents, MINH, LAN)).toBe(1_250_000);
  });

  it("đối xứng: balance(Lan→Minh) = -1.250.000", () => {
    expect(balanceBetween(seedEvents, LAN, MINH)).toBe(-1_250_000);
  });

  it("expense trả từ ví quỹ chung không ảnh hưởng nợ", () => {
    const events: BalanceEvent[] = [
      {
        type: "expense",
        paidFromSharedFund: true,
        splitMode: "even",
        allocations: [
          { userId: MINH, amount: 500_000 },
          { userId: LAN, amount: 500_000 },
        ],
      },
    ];
    expect(balanceBetween(events, MINH, LAN)).toBe(0);
  });

  it("thành viên không có trong allocations coi như 0", () => {
    const events: BalanceEvent[] = [
      {
        type: "expense",
        paidBy: MINH,
        paidFromSharedFund: false,
        splitMode: "custom",
        allocations: [{ userId: MINH, amount: 1_000_000 }],
      },
    ];
    expect(balanceBetween(events, MINH, LAN)).toBe(0);
  });

  it("payer_all không ảnh hưởng nợ", () => {
    const events: BalanceEvent[] = [
      {
        type: "expense",
        paidBy: MINH,
        paidFromSharedFund: false,
        splitMode: "payer_all",
        allocations: [{ userId: MINH, amount: 1_000_000 }],
      },
    ];
    expect(balanceBetween(events, MINH, LAN)).toBe(0);
  });
});
