export const FIXED_SIDES = [
  { name: "Violet", color: "#8179c4" },
  { name: "Indigo", color: "#668bb7" },
  { name: "Blue", color: "#5b9bd5" },
  { name: "Teal", color: "#4fa89c" },
  { name: "Moss", color: "#6fa281" },
  { name: "Green", color: "#74b66c" },
  { name: "Lime", color: "#a8bd58" },
  { name: "Amber", color: "#cf9951" },
  { name: "Orange", color: "#df7d4d" },
  { name: "Coral", color: "#dd6d69" },
  { name: "Rose", color: "#d36e83" },
  { name: "Pink", color: "#c878ac" },
  { name: "Plum", color: "#9d6fb5" },
  { name: "Slate", color: "#77849b" },
  { name: "Stone", color: "#9b927d" },
  { name: "Sand", color: "#c5ad82" },
] as const;

export type FixedSide = (typeof FIXED_SIDES)[number];
