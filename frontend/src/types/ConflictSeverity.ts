export const ConflictSeverity = ["MEDIUM", "HIGH", "CRITICAL"] as const;
export type ConflictSeverity = (typeof ConflictSeverity)[number];

export const CONFLICT_SEVERITY_RANK: Record<ConflictSeverity, number> = {
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};
