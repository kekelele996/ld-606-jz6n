import type { BerthPlan } from "../models/BerthPlan";
import type { ConflictSeverity } from "../constants/ConflictSeverity";
import { CONFLICT_SEVERITY_RANK } from "../constants/ConflictSeverity";

// 靠泊计划在冲突检测时只视为占用泊位的状态；已取消/已离港不再参与
const ACTIVE_STATUSES = new Set(["DRAFT", "CONFLICT", "APPROVED", "BERTHING"]);

export interface BerthConflict {
  planId: number;
  otherId: number;
  overlapMinutes: number;
  severity: ConflictSeverity;
}

export const toTime = (value: string): number => new Date(value).getTime();

export const isPlanActive = (plan: BerthPlan): boolean => ACTIVE_STATUSES.has(plan.status);

// 同一泊位、排除自身、时间区间半开半闭 [arrival, departure)
export function findOverlap(plan: BerthPlan, others: BerthPlan[]): BerthConflict | null {
  if (!isPlanActive(plan)) {
    return null;
  }
  const start = toTime(plan.planned_arrival);
  const end = toTime(plan.planned_departure);
  let worst: BerthConflict | null = null;
  for (const other of others) {
    if (other.id === plan.id || other.berth_id !== plan.berth_id || !isPlanActive(other)) {
      continue;
    }
    const overlapStart = Math.max(start, toTime(other.planned_arrival));
    const overlapEnd = Math.min(end, toTime(other.planned_departure));
    if (overlapStart < overlapEnd) {
      const overlapMinutes = Math.round((overlapEnd - overlapStart) / 60000);
      const severity = scoreSeverity(overlapStart, overlapEnd, [
        [start, end],
        [toTime(other.planned_arrival), toTime(other.planned_departure)]
      ]);
      const candidate: BerthConflict = { planId: plan.id, otherId: other.id, overlapMinutes, severity };
      if (!worst || CONFLICT_SEVERITY_RANK[candidate.severity] > CONFLICT_SEVERITY_RANK[worst.severity]) {
        worst = candidate;
      }
    }
  }
  return worst;
}

// 严重程度按“重叠时长占较短计划时长的比例”分级
export function scoreSeverity(overlapStart: number, overlapEnd: number, ranges: Array<[number, number]>): ConflictSeverity {
  const overlap = overlapEnd - overlapStart;
  const shorter = Math.min(...ranges.map(([start, end]) => end - start));
  const ratio = shorter > 0 ? overlap / shorter : 0;
  if (ratio >= 0.7) {
    return "CRITICAL";
  }
  if (ratio >= 0.3) {
    return "HIGH";
  }
  return "MEDIUM";
}

export function detectConflicts(plans: BerthPlan[]): Map<number, BerthConflict> {
  const result = new Map<number, BerthConflict>();
  for (const plan of plans) {
    const conflict = findOverlap(plan, plans);
    if (conflict) {
      result.set(plan.id, conflict);
    }
  }
  return result;
}
