export type ConflictSeverityLevel = "LOW" | "MEDIUM" | "HIGH";

// 与后端 PlanConflictEntry 对应：一条计划与另一条计划的单次重叠。
export interface BerthPlanConflict {
  plan_id: number;
  other_plan_id: number;
  berth_id: number;
  berth_code: string;
  vessel_name: string;
  other_vessel_name: string;
  overlap_start: string;
  overlap_end: string;
  overlap_hours: number;
  severity: ConflictSeverityLevel;
  reason: string;
}

export interface BerthOccupancy {
  total_berths: number;
  occupied_berths: number;
  occupancy_rate: number;
}

export interface BerthOverview {
  occupancy: BerthOccupancy;
  conflict_plan_count: number;
  conflicts: BerthPlanConflict[];
}

export interface ReassignResult {
  plan: import("./BerthPlan").BerthPlan;
  conflicts: BerthPlanConflict[];
  remaining_conflicts: BerthPlanConflict[];
  message: string;
}

export interface ReassignPayload {
  berth_id: number;
  dispatcher_id?: number;
  reason?: string;
}

// 改派候选泊位：长度合适标记 + 当前是否空闲 + 改派后是否仍有窗口重叠。
export interface BerthReassignOption {
  berth: import("./Berth").Berth;
  fits_length: boolean;
  currently_free: boolean;
  window_clear: boolean;
  conflicts_with: number[];
}
