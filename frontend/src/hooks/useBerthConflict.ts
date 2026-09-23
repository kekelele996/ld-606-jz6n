import { computed, type Signal } from "@angular/core";
import type { BerthPlan } from "../types/BerthPlan";
import type { Berth } from "../types/Berth";
import type { Vessel } from "../types/Vessel";
import type { BerthConflict } from "../types/BerthConflict";
import type { BerthReassignCandidate } from "../types/BerthReassignCandidate";
import { detectConflicts, findOverlap, isPlanActive, isTimeOverlap, toTime } from "../utils/berthConflict";

// 靠泊冲突检测 hook：被总览页与泊位页共用，保证冲突口径一致
export function useBerthConflict(
  plans: Signal<BerthPlan[]>,
  berths: Signal<Berth[]>,
  vessels: Signal<Vessel[]>
) {
  const conflictMap = computed<Map<number, BerthConflict>>(() => detectConflicts(plans()));

  const affectedPlans = computed<BerthPlan[]>(() => {
    const map = conflictMap();
    return plans()
      .filter((plan) => map.has(plan.id))
      .sort((a, b) => toTime(a.planned_arrival) - toTime(b.planned_arrival));
  });

  const affectedCount = computed(() => affectedPlans().length);

  // 每个泊位在计划周期内的占用计划数，供总览占用数字使用
  const occupancyByBerth = computed<Map<number, number>>(() => {
    const result = new Map<number, number>();
    for (const berth of berths()) {
      result.set(berth.id, 0);
    }
    for (const plan of plans()) {
      if (isPlanActive(plan)) {
        result.set(plan.berth_id, (result.get(plan.berth_id) ?? 0) + 1);
      }
    }
    return result;
  });

  const totalOccupancy = computed(() =>
    Array.from(occupancyByBerth().values()).reduce((sum, value) => sum + value, 0)
  );

  const conflictOf = (plan: BerthPlan): BerthConflict | undefined => conflictMap().get(plan.id);

  // 候选泊位：长度、水深合适且当前时间窗空闲；不合适/被占用的泊位也要返回以便页面标注
  const candidatesFor = (planId: number): BerthReassignCandidate[] => {
    const plan = plans().find((row) => row.id === planId);
    if (!plan) {
      return [];
    }
    const vessel = vessels().find((row) => row.id === plan.vessel_id);
    const start = plan.planned_arrival;
    const end = plan.planned_departure;
    return berths().map((berth) => {
      const suitable = vessel ? berth.length_m >= vessel.length_m && berth.water_depth_m >= vessel.draft_m : false;
      const blocking = plans().find(
        (other) =>
          other.id !== plan.id &&
          other.berth_id === berth.id &&
          isPlanActive(other) &&
          isTimeOverlap(start, end, other.planned_arrival, other.planned_departure)
      );
      return {
        berth_id: berth.id,
        berth_code: berth.berth_code,
        length_m: berth.length_m,
        water_depth_m: berth.water_depth_m,
        current_status: berth.current_status,
        suitable,
        free: suitable && !blocking && berth.current_status !== "MAINTENANCE",
        blocking_plan_id: blocking?.id ?? null
      };
    });
  };

  return { conflictMap, affectedPlans, affectedCount, occupancyByBerth, totalOccupancy, conflictOf, candidatesFor, findOverlap };
}
