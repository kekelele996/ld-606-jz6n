// 改派候选泊位：长度/水深是否合适，该时间窗是否空闲
export interface BerthReassignCandidate {
  berth_id: number;
  berth_code: string;
  length_m: number;
  water_depth_m: number;
  current_status: string;
  suitable: boolean;
  free: boolean;
  blocking_plan_id: number | null;
}
