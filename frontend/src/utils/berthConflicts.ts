import type { BerthPlan } from "../types/BerthPlan";
import type { Berth } from "../types/Berth";
import type { Vessel } from "../types/Vessel";
import type {
  BerthOccupancy,
  BerthOverview,
  BerthPlanConflict,
  BerthReassignOption,
  ConflictSeverityLevel
} from "../types/Conflict";

// 已完结或已取消的计划不参与时间重叠检测与泊位占用统计。
const INACTIVE_STATUSES = new Set(["CANCELLED", "DEPARTED"]);

export const isActivePlan = (plan: BerthPlan): boolean => !INACTIVE_STATUSES.has(plan.status);

const toMillis = (value: string): number => new Date(value).getTime();

export const planOverlaps = (a: BerthPlan, b: BerthPlan): boolean =>
  a.berth_id === b.berth_id &&
  toMillis(a.planned_arrival) < toMillis(b.planned_departure) &&
  toMillis(b.planned_arrival) < toMillis(a.planned_departure);

const overlapWindow = (a: BerthPlan, b: BerthPlan) => ({
  start: Math.max(toMillis(a.planned_arrival), toMillis(b.planned_arrival)),
  end: Math.min(toMillis(a.planned_departure), toMillis(b.planned_departure))
});

// 严重程度：重叠时长占较短计划窗口的比例，>=50% 严重，>=20% 中度，其余轻度。
export const severityOf = (a: BerthPlan, b: BerthPlan): ConflictSeverityLevel => {
  const { start, end } = overlapWindow(a, b);
  const aMs = toMillis(a.planned_departure) - toMillis(a.planned_arrival);
  const bMs = toMillis(b.planned_departure) - toMillis(b.planned_arrival);
  const shorter = Math.max(Math.min(aMs, bMs), 1);
  const ratio = (end - start) / shorter;
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

// 离线兜底：后端不可达时在前端本地计算同一套冲突结果。
export const detectPlanConflicts = (
  plans: BerthPlan[],
  berths: Berth[],
  vessels: Vessel[]
): BerthPlanConflict[] => {
  const active = plans.filter(isActivePlan);
  const berthById = new Map(berths.map((berth) => [berth.id, berth]));
  const vesselById = new Map(vessels.map((vessel) => [vessel.id, vessel]));
  const entries: BerthPlanConflict[] = [];
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i];
      const b = active[j];
      if (!planOverlaps(a, b)) continue;
      const { start, end } = overlapWindow(a, b);
      const overlapStart = new Date(start).toISOString();
      const overlapEnd = new Date(end).toISOString();
      const berthCode = berthById.get(a.berth_id)?.berth_code ?? `#${a.berth_id}`;
      const vesselA = vesselById.get(a.vessel_id)?.vessel_name ?? `#${a.vessel_id}`;
      const vesselB = vesselById.get(b.vessel_id)?.vessel_name ?? `#${b.vessel_id}`;
      const base = {
        berth_id: a.berth_id,
        berth_code: berthCode,
        overlap_start: overlapStart,
        overlap_end: overlapEnd,
        overlap_hours: Math.round(((end - start) / 3_600_000) * 10) / 10,
        severity: severityOf(a, b)
      };
      entries.push({
        ...base,
        plan_id: a.id,
        other_plan_id: b.id,
        vessel_name: vesselA,
        other_vessel_name: vesselB,
        reason: buildConflictReason(berthCode, b.id, vesselB, overlapStart, overlapEnd)
      });
      entries.push({
        ...base,
        plan_id: b.id,
        other_plan_id: a.id,
        vessel_name: vesselB,
        other_vessel_name: vesselA,
        reason: buildConflictReason(berthCode, a.id, vesselA, overlapStart, overlapEnd)
      });
    }
  }
  return entries;
};

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

export const buildOverview = (plans: BerthPlan[], berths: Berth[], vessels: Vessel[]): BerthOverview => {
  const occupied = occupiedBerthIds(plans);
  const occupancy: BerthOccupancy = {
    total_berths: berths.length,
    occupied_berths: occupied.size,
    occupancy_rate: berths.length === 0 ? 0 : Math.round((occupied.size / berths.length) * 1000) / 10
  };
  const conflicts = detectPlanConflicts(plans, berths, vessels);
  return { occupancy, conflict_plan_count: new Set(conflicts.map((entry) => entry.plan_id)).size, conflicts };
};

// 改派候选：长度是否合适、当前是否空闲、改派后窗口是否仍有重叠。
export const buildReassignOptions = (
  plan: BerthPlan,
  plans: BerthPlan[],
  berths: Berth[],
  vessels: Vessel[],
  now: Date = new Date()
): BerthReassignOption[] => {
  const vessel = vessels.find((row) => row.id === plan.vessel_id);
  const occupied = occupiedBerthIds(plans, now);
  return berths
    .filter((berth) => berth.id !== plan.berth_id)
    .map((berth) => {
      const conflictsWith = plans
        .filter(
          (other) =>
            other.id !== plan.id &&
            other.berth_id === berth.id &&
            isActivePlan(other) &&
            planOverlaps({ ...plan, berth_id: berth.id }, other)
        )
        .map((other) => other.id);
      return {
        berth,
        fits_length: vessel ? berth.length_m >= vessel.length_m : true,
        currently_free: !occupied.has(berth.id),
        window_clear: conflictsWith.length === 0,
        conflicts_with: conflictsWith
      };
    });
};
