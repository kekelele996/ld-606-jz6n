import type { Vessel } from "../types/Vessel";
import type { Berth } from "../types/Berth";
import type { BerthPlan } from "../types/BerthPlan";
import type { YardSlot } from "../types/YardSlot";
import type { WorkTask } from "../types/WorkTask";

// 全部本地种子数据，与 backend/src/seed.ts 保持一致，供离线评审回退使用
export const mockData = {
  vessel: [
    { id: 1, vessel_name: "远洋号", imo_no: "IMO-9000001", carrier: "远海航运", length_m: 290, draft_m: 12.5, eta: "2026-09-24T06:00:00+08:00", etd: "2026-09-24T22:00:00+08:00", status: "EXPECTED" },
    { id: 2, vessel_name: "南运18", imo_no: "IMO-9000002", carrier: "南运物流", length_m: 150, draft_m: 8.0, eta: "2026-09-24T16:00:00+08:00", etd: "2026-09-24T23:00:00+08:00", status: "EXPECTED" },
    { id: 3, vessel_name: "远辰湖", imo_no: "IMO-9000003", carrier: "辰光船务", length_m: 240, draft_m: 11.0, eta: "2026-09-25T05:30:00+08:00", etd: "2026-09-25T16:00:00+08:00", status: "EXPECTED" },
    { id: 4, vessel_name: "海骏", imo_no: "IMO-9000004", carrier: "海骏集团", length_m: 210, draft_m: 10.5, eta: "2026-09-25T11:00:00+08:00", etd: "2026-09-25T21:00:00+08:00", status: "EXPECTED" },
    { id: 5, vessel_name: "东方星河", imo_no: "IMO-9000005", carrier: "星河海运", length_m: 280, draft_m: 12.8, eta: "2026-09-24T05:00:00+08:00", etd: "2026-09-25T22:00:00+08:00", status: "IN_PORT" },
    { id: 6, vessel_name: "清源海", imo_no: "IMO-9000006", carrier: "清源航运", length_m: 190, draft_m: 9.5, eta: "2026-09-26T07:00:00+08:00", etd: "2026-09-26T15:00:00+08:00", status: "EXPECTED" },
    { id: 7, vessel_name: "新浦江", imo_no: "IMO-9000007", carrier: "浦江船代", length_m: 230, draft_m: 11.0, eta: "2026-09-26T12:30:00+08:00", etd: "2026-09-26T18:30:00+08:00", status: "EXPECTED" },
    { id: 8, vessel_name: "华瑞", imo_no: "IMO-9000008", carrier: "华瑞物流", length_m: 200, draft_m: 10.0, eta: "2026-09-26T08:00:00+08:00", etd: "2026-09-26T19:00:00+08:00", status: "DRAFT" },
    { id: 9, vessel_name: "长锦", imo_no: "IMO-9000009", carrier: "长锦海运", length_m: 170, draft_m: 9.0, eta: "2026-09-27T09:00:00+08:00", etd: "2026-09-27T17:00:00+08:00", status: "EXPECTED" }
  ] as Vessel[],
  berth: [
    { id: 1, berth_code: "B-01", length_m: 300, water_depth_m: 14.0, berth_type: "GENERAL", current_status: "AVAILABLE", safety_note: "全天候靠泊，注意东南涌浪" },
    { id: 2, berth_code: "B-02", length_m: 220, water_depth_m: 12.0, berth_type: "CONTAINER", current_status: "OCCUPIED", safety_note: "集装箱泊位，岸桥 2 台" },
    { id: 3, berth_code: "B-03", length_m: 160, water_depth_m: 10.0, berth_type: "BULK", current_status: "AVAILABLE", safety_note: "小型散货泊位" },
    { id: 4, berth_code: "B-04", length_m: 120, water_depth_m: 9.0, berth_type: "GENERAL", current_status: "MAINTENANCE", safety_note: "9 月例行维护，暂停安排" },
    { id: 5, berth_code: "B-05", length_m: 260, water_depth_m: 13.0, berth_type: "CONTAINER", current_status: "AVAILABLE", safety_note: "深水集装箱泊位" },
    { id: 6, berth_code: "B-06", length_m: 320, water_depth_m: 15.0, berth_type: "GENERAL", current_status: "AVAILABLE", safety_note: "最大泊位，可接超大型船" }
  ] as Berth[],
  berthPlan: [
    { id: 1, vessel_id: 1, berth_id: 1, planned_arrival: "2026-09-24T08:00:00+08:00", planned_departure: "2026-09-24T20:00:00+08:00", priority: "HIGH", status: "CONFLICT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 2, vessel_id: 2, berth_id: 1, planned_arrival: "2026-09-24T17:30:00+08:00", planned_departure: "2026-09-24T21:00:00+08:00", priority: "NORMAL", status: "CONFLICT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 3, vessel_id: 3, berth_id: 2, planned_arrival: "2026-09-25T07:00:00+08:00", planned_departure: "2026-09-25T15:00:00+08:00", priority: "HIGH", status: "CONFLICT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 4, vessel_id: 4, berth_id: 2, planned_arrival: "2026-09-25T12:00:00+08:00", planned_departure: "2026-09-25T20:00:00+08:00", priority: "NORMAL", status: "CONFLICT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 5, vessel_id: 5, berth_id: 5, planned_arrival: "2026-09-24T06:00:00+08:00", planned_departure: "2026-09-24T22:00:00+08:00", priority: "HIGH", status: "APPROVED", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 10, vessel_id: 5, berth_id: 5, planned_arrival: "2026-09-25T08:00:00+08:00", planned_departure: "2026-09-25T20:00:00+08:00", priority: "NORMAL", status: "APPROVED", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 6, vessel_id: 6, berth_id: 5, planned_arrival: "2026-09-26T08:00:00+08:00", planned_departure: "2026-09-26T14:00:00+08:00", priority: "NORMAL", status: "CONFLICT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 7, vessel_id: 7, berth_id: 5, planned_arrival: "2026-09-26T13:30:00+08:00", planned_departure: "2026-09-26T17:30:00+08:00", priority: "NORMAL", status: "CONFLICT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 8, vessel_id: 8, berth_id: 6, planned_arrival: "2026-09-26T09:00:00+08:00", planned_departure: "2026-09-26T18:00:00+08:00", priority: "LOW", status: "DRAFT", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null },
    { id: 9, vessel_id: 9, berth_id: 6, planned_arrival: "2026-09-27T10:00:00+08:00", planned_departure: "2026-09-27T16:00:00+08:00", priority: "NORMAL", status: "APPROVED", dispatcher_id: 1, conflict_plan_id: null, conflict_severity: null, conflict_reason: null, reassigned_from_berth_id: null, reassigned_at: null, reassigned_by: null }
  ] as BerthPlan[],
  yardSlot: [
    { id: 1, yard_area: "A区", row_no: "R01", bay_no: "B01", tier_no: "T01", container_no: "CXUU1000001", slot_status: "OCCUPIED", cargo_type: "GENERAL" },
    { id: 2, yard_area: "A区", row_no: "R01", bay_no: "B02", tier_no: "T01", container_no: "CXUU1000002", slot_status: "RESERVED", cargo_type: "REEFER" },
    { id: 3, yard_area: "B区", row_no: "R02", bay_no: "B01", tier_no: "T02", container_no: "", slot_status: "EMPTY", cargo_type: "GENERAL" },
    { id: 4, yard_area: "C区", row_no: "R03", bay_no: "B03", tier_no: "T01", container_no: "CXUU1000003", slot_status: "LOCKED", cargo_type: "DANGEROUS" }
  ] as YardSlot[],
  workTask: [
    { id: 1, berth_plan_id: 1, yard_slot_id: 1, task_type: "DISCHARGE", team_id: 1, status: "PENDING", planned_start: "2026-09-24T08:30:00+08:00", finished_at: null },
    { id: 2, berth_plan_id: 3, yard_slot_id: 2, task_type: "LOAD", team_id: 2, status: "PENDING", planned_start: "2026-09-25T07:30:00+08:00", finished_at: null },
    { id: 3, berth_plan_id: 5, yard_slot_id: 4, task_type: "INSPECTION", team_id: 3, status: "DONE", planned_start: "2026-09-24T06:30:00+08:00", finished_at: "2026-09-24T07:30:00+08:00" }
  ] as WorkTask[]
};
