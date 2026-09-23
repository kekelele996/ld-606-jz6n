export const ConflictSeverity = ["LOW","MEDIUM","HIGH"] as const;
export type ConflictSeverity = (typeof ConflictSeverity)[number];
export const ConflictSeverityText: Record<ConflictSeverity, string> = {
  LOW: "轻度",
  MEDIUM: "中度",
  HIGH: "严重"
};
