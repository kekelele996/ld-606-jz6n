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
  conflict_reason: null,
  ...overrides
});

export const createBerthPlanForm = createDefaultBerthPlan;
export const createBerthPlanResponse = createDefaultBerthPlan;

export interface ReassignForm {
  plan_id: number;
  berth_id: number | null;
  reason: string;
}

export const createReassignForm = (planId: number): ReassignForm => ({
  plan_id: planId,
  berth_id: null,
  reason: ""
});
