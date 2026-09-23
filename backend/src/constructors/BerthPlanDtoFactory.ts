import type { BerthPlan } from "../models/BerthPlan";
import type { PlanConflictEntry } from "../utils/berthConflicts";

export const createBerthPlanDto = (overrides: Partial<BerthPlan> = {}): BerthPlan => ({
  id: 0,
  vessel_id: 0,
  berth_id: 0,
  planned_arrival: "",
  planned_departure: "",
  priority: "NORMAL",
  status: "DRAFT",
  dispatcher_id: 1,
  conflict_reason: null,
  ...overrides
});

export interface BerthOverviewDto {
  occupancy: { total_berths: number; occupied_berths: number; occupancy_rate: number };
  conflict_plan_count: number;
  conflicts: PlanConflictEntry[];
}

export const createBerthOverviewDto = (
  occupancy: BerthOverviewDto["occupancy"],
  conflicts: PlanConflictEntry[]
): BerthOverviewDto => ({
  occupancy,
  conflict_plan_count: new Set(conflicts.map((entry) => entry.plan_id)).size,
  conflicts
});

export interface ReassignResultDto {
  plan: BerthPlan;
  conflicts: PlanConflictEntry[];
  remaining_conflicts: PlanConflictEntry[];
  message: string;
}

export const createReassignResultDto = (
  plan: BerthPlan,
  conflicts: PlanConflictEntry[],
  remainingConflicts: PlanConflictEntry[],
  message: string
): ReassignResultDto => ({
  plan,
  conflicts,
  remaining_conflicts: remainingConflicts,
  message
});
