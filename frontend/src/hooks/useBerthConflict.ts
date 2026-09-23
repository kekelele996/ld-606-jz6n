import type { BerthPlan } from "../types/BerthPlan";
import type { Berth } from "../types/Berth";
import type { Vessel } from "../types/Vessel";
import type { BerthPlanConflict } from "../types/Conflict";
import { detectPlanConflicts } from "../utils/berthConflicts";

// 页面共享：把冲突检测结果按 plan_id 归组，卡片与总览表都从这里取数。
export function useBerthConflict(plans: BerthPlan[] = [], berths: Berth[] = [], vessels: Vessel[] = []) {
  const conflicts: BerthPlanConflict[] = detectPlanConflicts(plans, berths, vessels);
  const byPlan = new Map<number, BerthPlanConflict[]>();
  for (const entry of conflicts) {
    const list = byPlan.get(entry.plan_id) ?? [];
    list.push(entry);
    byPlan.set(entry.plan_id, list);
  }
  return {
    conflicts,
    byPlan,
    total: conflicts.length,
    affectedPlanIds: [...byPlan.keys()],
    conflictsFor: (planId: number): BerthPlanConflict[] => byPlan.get(planId) ?? []
  };
}
