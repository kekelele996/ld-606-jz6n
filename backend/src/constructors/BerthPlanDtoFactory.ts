import type { BerthPlan } from "../models/BerthPlan";

export const createBerthPlanDto = (overrides: Partial<BerthPlan> = {}): BerthPlan => ({
  id: 1,
  vessel_id: 1,
  berth_id: 1,
  planned_arrival: "2026-09-24T08:00:00+08:00",
  planned_departure: "2026-09-24T18:00:00+08:00",
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
