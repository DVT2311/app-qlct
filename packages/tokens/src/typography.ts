// Nguồn: SPEC.md mục 8.1 — Be Vietnam Pro cho toàn bộ giao diện và số, Lora 700 cho tiêu đề màn hình.
export const fontFamilies = {
  body: "Be Vietnam Pro",
  heading: "Lora",
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const headingWeight = fontWeights.bold; // Lora chỉ dùng 700

export type FontFamilyToken = keyof typeof fontFamilies;
export type FontWeightToken = keyof typeof fontWeights;
