export interface BerthPlan {
  id: number;
  vessel_id: number;
  berth_id: number;
  planned_arrival: string;
  planned_departure: string;
  priority: string;
  status: string;
  dispatcher_id: number;
  conflict_plan_id: number | null;
  conflict_severity: string | null;
  conflict_reason: string | null;
  reassigned_from_berth_id: number | null;
  reassigned_at: string | null;
  reassigned_by: number | null;
}
