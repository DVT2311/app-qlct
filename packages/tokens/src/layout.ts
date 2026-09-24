// Nguồn: SPEC.md mục 8.1 — bo góc thẻ 16–18px, vùng chạm tối thiểu 44px, icon nét 1.8px.
export const radius = {
  card: 18,
  cardSmall: 16,
} as const;

export const minTouchTarget = 44;

export const iconStrokeWidth = 1.8;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export type SpacingToken = keyof typeof spacing;
