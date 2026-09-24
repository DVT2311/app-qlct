// Nguồn: SPEC.md mục 8.1
export const colors = {
  bg: "#F6F2EA",
  surface: "#FFFFFF",
  border: "#E4DDD0",
  divider: "#EFEAE0",
  ink: "#1B1A17",
  muted: "#5E594F",

  personA: "#1F5F8B",
  personB: "#B4502A",

  shared: "#2F6A4A",
  sharedSoft: "#E8F1EB",
  sharedInk: "#24533A",

  personASoft: "#E6EEF4",
  personAInk: "#174A6C",

  gold: "#8A6412",
} as const;

export type ColorToken = keyof typeof colors;
