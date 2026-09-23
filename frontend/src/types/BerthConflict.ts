import type { ConflictSeverity } from "../types/ConflictSeverity";

export interface BerthConflict {
  planId: number;
  otherId: number;
  overlapMinutes: number;
  severity: ConflictSeverity;
}
