import type { BerthPlan } from "../types/BerthPlan";

export const createDefaultBerthPlan = (overrides: Partial<BerthPlan> = {}): BerthPlan => ({
  id: 0,
  vessel_id: 0,
  berth_id: 0,
  planned_arrival: "",
  planned_departure: "",
  priority: "NORMAL",
  status: "DRAFT",
  dispatcher_id: 1,
  conflict_plan_id: null,
  conflict_severity: null,
  conflict_reason: null,
  reassigned_from_berth_id: null,
  reassigned_at: null,
  reassigned_by: null,
  ...overrides
});

export const createBerthPlanForm = createDefaultBerthPlan;
export const createBerthPlanResponse = createDefaultBerthPlan;
