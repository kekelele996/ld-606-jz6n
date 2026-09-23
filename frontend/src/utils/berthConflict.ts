import type { BerthPlan } from "../types/BerthPlan";
import type { ConflictSeverity } from "../types/ConflictSeverity";
import type { BerthConflict } from "../types/BerthConflict";
import { CONFLICT_SEVERITY_RANK } from "../types/ConflictSeverity";

// 与后端 utils/berthConflict 保持一致的冲突口径
const ACTIVE_STATUSES = new Set(["DRAFT", "CONFLICT", "APPROVED", "BERTHING"]);

export const toTime = (value: string): number => new Date(value).getTime();

export const isPlanActive = (plan: BerthPlan): boolean => ACTIVE_STATUSES.has(plan.status);

export function isTimeOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return Math.max(toTime(aStart), toTime(bStart)) < Math.min(toTime(aEnd), toTime(bEnd));
}

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

// 提交改派后按新泊位重新判定；无重叠时进入 APPROVED，仍重叠时继续标记并写明原因
export function reconcileConflicts(plans: BerthPlan[]): BerthPlan[] {
  return plans.map((plan) => {
    const conflict = findOverlap(plan, plans);
    if (!conflict) {
      return {
        ...plan,
        conflict_plan_id: null,
        conflict_severity: null,
        status: plan.status === "CONFLICT" ? "APPROVED" : plan.status,
        conflict_reason: plan.status === "CONFLICT" ? null : plan.conflict_reason
      };
    }
    return {
      ...plan,
      status: "CONFLICT",
      conflict_plan_id: conflict.otherId,
      conflict_severity: conflict.severity
    };
  });
}
