import type { BerthPlan } from "../models/BerthPlan";
import type { Berth } from "../models/Berth";
import type { Vessel } from "../models/Vessel";
import type { ConflictSeverity } from "../constants/ConflictSeverity";

// 冲突条目：以“某条计划与另一条计划重叠”为一条记录，页面按 plan_id 归组展示。
export interface PlanConflictEntry {
  plan_id: number;
  other_plan_id: number;
  berth_id: number;
  berth_code: string;
  vessel_name: string;
  other_vessel_name: string;
  overlap_start: string;
  overlap_end: string;
  overlap_hours: number;
  severity: ConflictSeverity;
  reason: string;
}

// 已完结或已取消的计划不再参与时间重叠检测与泊位占用统计。
const INACTIVE_STATUSES = new Set(["CANCELLED", "DEPARTED"]);

export const isActivePlan = (plan: BerthPlan): boolean => !INACTIVE_STATUSES.has(plan.status);

const toMillis = (value: string): number => new Date(value).getTime();

export const overlaps = (a: BerthPlan, b: BerthPlan): boolean =>
  a.berth_id === b.berth_id &&
  toMillis(a.planned_arrival) < toMillis(b.planned_departure) &&
  toMillis(b.planned_arrival) < toMillis(a.planned_departure);

const overlapWindow = (a: BerthPlan, b: BerthPlan) => {
  const start = Math.max(toMillis(a.planned_arrival), toMillis(b.planned_arrival));
  const end = Math.min(toMillis(a.planned_departure), toMillis(b.planned_departure));
  return { start, end };
};

// 严重程度：重叠时长占较短计划窗口的比例，>=50% 严重，>=20% 中度，其余轻度。
export const severityOf = (a: BerthPlan, b: BerthPlan): ConflictSeverity => {
  const { start, end } = overlapWindow(a, b);
  const overlapMs = end - start;
  const aMs = toMillis(a.planned_departure) - toMillis(a.planned_arrival);
  const bMs = toMillis(b.planned_departure) - toMillis(b.planned_arrival);
  const shorter = Math.max(Math.min(aMs, bMs), 1);
  const ratio = overlapMs / shorter;
  if (ratio >= 0.5) return "HIGH";
  if (ratio >= 0.2) return "MEDIUM";
  return "LOW";
};

export const buildConflictReason = (
  berthCode: string,
  otherPlanId: number,
  otherVesselName: string,
  overlapStart: string,
  overlapEnd: string
): string =>
  `与计划#${otherPlanId}（${otherVesselName}）在泊位 ${berthCode} 的 ${overlapStart} ~ ${overlapEnd} 时间重叠`;

export const detectPlanConflicts = (
  plans: BerthPlan[],
  berths: Berth[],
  vessels: Vessel[]
): PlanConflictEntry[] => {
  const active = plans.filter(isActivePlan);
  const berthById = new Map(berths.map((berth) => [berth.id, berth]));
  const vesselById = new Map(vessels.map((vessel) => [vessel.id, vessel]));
  const entries: PlanConflictEntry[] = [];
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i];
      const b = active[j];
      if (!overlaps(a, b)) continue;
      const { start, end } = overlapWindow(a, b);
      const overlapStart = new Date(start).toISOString();
      const overlapEnd = new Date(end).toISOString();
      const overlapHours = Math.round(((end - start) / 3_600_000) * 10) / 10;
      const berthCode = berthById.get(a.berth_id)?.berth_code ?? `#${a.berth_id}`;
      const vesselA = vesselById.get(a.vessel_id)?.vessel_name ?? `#${a.vessel_id}`;
      const vesselB = vesselById.get(b.vessel_id)?.vessel_name ?? `#${b.vessel_id}`;
      const severity = severityOf(a, b);
      entries.push({
        plan_id: a.id,
        other_plan_id: b.id,
        berth_id: a.berth_id,
        berth_code: berthCode,
        vessel_name: vesselA,
        other_vessel_name: vesselB,
        overlap_start: overlapStart,
        overlap_end: overlapEnd,
        overlap_hours: overlapHours,
        severity,
        reason: buildConflictReason(berthCode, b.id, vesselB, overlapStart, overlapEnd)
      });
      entries.push({
        plan_id: b.id,
        other_plan_id: a.id,
        berth_id: a.berth_id,
        berth_code: berthCode,
        vessel_name: vesselB,
        other_vessel_name: vesselA,
        overlap_start: overlapStart,
        overlap_end: overlapEnd,
        overlap_hours: overlapHours,
        severity,
        reason: buildConflictReason(berthCode, a.id, vesselA, overlapStart, overlapEnd)
      });
    }
  }
  return entries;
};

export const conflictsForPlan = (entries: PlanConflictEntry[], planId: number): PlanConflictEntry[] =>
  entries.filter((entry) => entry.plan_id === planId);

// 当前时刻被进行中窗口覆盖的泊位视为占用，用于总览占用率。
export const occupiedBerthIds = (plans: BerthPlan[], now: Date = new Date()): Set<number> => {
  const nowMs = now.getTime();
  const ids = new Set<number>();
  for (const plan of plans) {
    if (!isActivePlan(plan)) continue;
    if (toMillis(plan.planned_arrival) <= nowMs && nowMs < toMillis(plan.planned_departure)) {
      ids.add(plan.berth_id);
    }
  }
  return ids;
};
