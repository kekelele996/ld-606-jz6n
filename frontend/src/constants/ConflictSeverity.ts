import type { ConflictSeverity } from "../types/ConflictSeverity";

export const ConflictSeverityText: Record<ConflictSeverity, string> = {
  MEDIUM: "轻度",
  HIGH: "明显",
  CRITICAL: "严重"
};

export const ConflictSeverityHint: Record<ConflictSeverity, string> = {
  MEDIUM: "时间窗短时间重叠，可协调前后泊位作业衔接",
  HIGH: "重叠时段较长，建议改靠空闲泊位",
  CRITICAL: "计划时段几乎完全重叠，必须立即改派"
};
