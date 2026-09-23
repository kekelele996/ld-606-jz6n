export interface BerthPlanPayload {
  berth_id?: number;
  dispatcher_id?: number;
  reason?: string;
  [key: string]: unknown;
}

export interface BerthPlanReassignPayload {
  berth_id: number;
  dispatcher_id?: number;
}
