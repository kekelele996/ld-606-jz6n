// 靠泊冲突严重程度：同一泊位时间重叠比例越大越严重
// MEDIUM 轻度重叠 / HIGH 明显重叠 / CRITICAL 严重重叠
export const ConflictSeverity = ["MEDIUM", "HIGH", "CRITICAL"] as const;
export type ConflictSeverity = (typeof ConflictSeverity)[number];

export const CONFLICT_SEVERITY_RANK: Record<ConflictSeverity, number> = {
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};

export const ConflictSeverityText: Record<ConflictSeverity, string> = {
  MEDIUM: "轻度",
  HIGH: "明显",
  CRITICAL: "严重"
};
