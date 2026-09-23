// 本地种子数据：围绕当前调度日 2026-09-23 编排，刻意包含多组同泊位时间重叠计划。
// 运行期由各 Repository 在内存中持有与变更，服务重启前持续保留改派结果。
export const seed = {
  "vessel": [
    {
      "id": 1,
      "vessel_name": "东方海卫",
      "imo_no": "IMO-9472801",
      "carrier": "东方海运",
      "length_m": 285,
      "draft_m": 12.4,
      "eta": "2026-09-24T02:00:00+08:00",
      "etd": "2026-09-25T06:00:00+08:00",
      "status": "EXPECTED"
    },
    {
      "id": 2,
      "vessel_name": "远锦河",
      "imo_no": "IMO-9238751",
      "carrier": "远洋联运",
      "length_m": 240,
      "draft_m": 10.8,
      "eta": "2026-09-24T04:00:00+08:00",
      "etd": "2026-09-26T06:00:00+08:00",
      "status": "EXPECTED"
    },
    {
      "id": 3,
      "vessel_name": "南方之星",
      "imo_no": "IMO-9312094",
      "carrier": "南方航运",
      "length_m": 190,
      "draft_m": 9.5,
      "eta": "2026-09-24T08:00:00+08:00",
      "etd": "2026-09-25T12:00:00+08:00",
      "status": "EXPECTED"
    },
    {
      "id": 4,
      "vessel_name": "海丰快运",
      "imo_no": "IMO-9561103",
      "carrier": "海丰物流",
      "length_m": 160,
      "draft_m": 8.2,
      "eta": "2026-09-24T12:00:00+08:00",
      "etd": "2026-09-25T00:00:00+08:00",
      "status": "EXPECTED"
    },
    {
      "id": 5,
      "vessel_name": "长航盛达",
      "imo_no": "IMO-9104472",
      "carrier": "长航集团",
      "length_m": 210,
      "draft_m": 10.1,
      "eta": "2026-09-23T06:00:00+08:00",
      "etd": "2026-09-24T06:00:00+08:00",
      "status": "BERTHING"
    },
    {
      "id": 6,
      "vessel_name": "金穗号",
      "imo_no": "IMO-9688214",
      "carrier": "金穗船务",
      "length_m": 140,
      "draft_m": 7.4,
      "eta": "2026-09-23T09:00:00+08:00",
      "etd": "2026-09-24T09:00:00+08:00",
      "status": "BERTHING"
    },
    {
      "id": 7,
      "vessel_name": "新浦洋",
      "imo_no": "IMO-9723358",
      "carrier": "新浦航运",
      "length_m": 230,
      "draft_m": 11.0,
      "eta": "2026-09-27T06:00:00+08:00",
      "etd": "2026-09-28T06:00:00+08:00",
      "status": "EXPECTED"
    }
  ],
  "berth": [
    {
      "id": 1,
      "berth_code": "B-01",
      "length_m": 300,
      "water_depth_m": 14.0,
      "berth_type": "DEEP_SEA",
      "current_status": "OCCUPIED",
      "safety_note": "主航道侧，限夜间靠离"
    },
    {
      "id": 2,
      "berth_code": "B-02",
      "length_m": 250,
      "water_depth_m": 12.0,
      "berth_type": "DEEP_SEA",
      "current_status": "OCCUPIED",
      "safety_note": ""
    },
    {
      "id": 3,
      "berth_code": "B-03",
      "length_m": 220,
      "water_depth_m": 11.0,
      "berth_type": "GENERAL",
      "current_status": "OCCUPIED",
      "safety_note": "门机 2 台"
    },
    {
      "id": 4,
      "berth_code": "B-04",
      "length_m": 180,
      "water_depth_m": 9.5,
      "berth_type": "GENERAL",
      "current_status": "AVAILABLE",
      "safety_note": ""
    },
    {
      "id": 5,
      "berth_code": "B-05",
      "length_m": 260,
      "water_depth_m": 13.0,
      "berth_type": "DEEP_SEA",
      "current_status": "AVAILABLE",
      "safety_note": "新建泊位，试运行"
    },
    {
      "id": 6,
      "berth_code": "B-06",
      "length_m": 200,
      "water_depth_m": 10.0,
      "berth_type": "GENERAL",
      "current_status": "AVAILABLE",
      "safety_note": "当前空闲，09-25 起已有计划"
    }
  ],
  "berthPlan": [
    // B-01：P1（大船）与 P5 在 09-24 02:00~18:00 重叠 16h，严重冲突
    {
      "id": 1,
      "vessel_id": 1,
      "berth_id": 1,
      "planned_arrival": "2026-09-24T02:00:00+08:00",
      "planned_departure": "2026-09-25T06:00:00+08:00",
      "priority": "HIGH",
      "status": "CONFLICT",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-03：P2 与 P6 全窗口重叠 24h，严重冲突
    {
      "id": 2,
      "vessel_id": 2,
      "berth_id": 3,
      "planned_arrival": "2026-09-24T06:00:00+08:00",
      "planned_departure": "2026-09-26T06:00:00+08:00",
      "priority": "HIGH",
      "status": "CONFLICT",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-03：P3 与 P6 重叠 10h，中度冲突
    {
      "id": 3,
      "vessel_id": 3,
      "berth_id": 3,
      "planned_arrival": "2026-09-24T08:00:00+08:00",
      "planned_departure": "2026-09-25T12:00:00+08:00",
      "priority": "NORMAL",
      "status": "CONFLICT",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-04：P4 与 P7 重叠 2h，轻度冲突
    {
      "id": 4,
      "vessel_id": 4,
      "berth_id": 4,
      "planned_arrival": "2026-09-24T12:00:00+08:00",
      "planned_departure": "2026-09-25T00:00:00+08:00",
      "priority": "NORMAL",
      "status": "CONFLICT",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-01 靠泊中，与 P1 冲突
    {
      "id": 5,
      "vessel_id": 5,
      "berth_id": 1,
      "planned_arrival": "2026-09-23T06:00:00+08:00",
      "planned_departure": "2026-09-24T18:00:00+08:00",
      "priority": "NORMAL",
      "status": "BERTHING",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-03 靠泊中，与 P2/P3 冲突
    {
      "id": 6,
      "vessel_id": 6,
      "berth_id": 3,
      "planned_arrival": "2026-09-23T09:00:00+08:00",
      "planned_departure": "2026-09-24T18:00:00+08:00",
      "priority": "LOW",
      "status": "BERTHING",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-04 靠泊中，与 P4 轻度重叠
    {
      "id": 7,
      "vessel_id": 7,
      "berth_id": 4,
      "planned_arrival": "2026-09-23T08:00:00+08:00",
      "planned_departure": "2026-09-24T14:00:00+08:00",
      "priority": "LOW",
      "status": "BERTHING",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-02 靠泊中，不与他人冲突
    {
      "id": 8,
      "vessel_id": 7,
      "berth_id": 2,
      "planned_arrival": "2026-09-23T07:00:00+08:00",
      "planned_departure": "2026-09-24T07:00:00+08:00",
      "priority": "NORMAL",
      "status": "APPROVED",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-02 未来计划，空闲窗口，不冲突
    {
      "id": 9,
      "vessel_id": 4,
      "berth_id": 2,
      "planned_arrival": "2026-09-27T06:00:00+08:00",
      "planned_departure": "2026-09-28T06:00:00+08:00",
      "priority": "LOW",
      "status": "DRAFT",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // 已离港计划，不参与冲突与占用
    {
      "id": 10,
      "vessel_id": 6,
      "berth_id": 4,
      "planned_arrival": "2026-09-20T06:00:00+08:00",
      "planned_departure": "2026-09-21T06:00:00+08:00",
      "priority": "NORMAL",
      "status": "DEPARTED",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    {
      "id": 11,
      "vessel_id": 3,
      "berth_id": 4,
      "planned_arrival": "2026-09-19T06:00:00+08:00",
      "planned_departure": "2026-09-20T06:00:00+08:00",
      "priority": "NORMAL",
      "status": "CANCELLED",
      "dispatcher_id": 1,
      "conflict_reason": null
    },
    // B-06 未来计划：泊位当前空闲，但 09-25 起被占用，用于演示“改派后仍重叠”
    {
      "id": 12,
      "vessel_id": 4,
      "berth_id": 6,
      "planned_arrival": "2026-09-25T06:00:00+08:00",
      "planned_departure": "2026-09-26T06:00:00+08:00",
      "priority": "NORMAL",
      "status": "APPROVED",
      "dispatcher_id": 1,
      "conflict_reason": null
    }
  ],
  "yardSlot": [
    {
      "id": 1,
      "yard_area": "A区",
      "row_no": "R1",
      "bay_no": "B01",
      "tier_no": "T1",
      "container_no": "CONT-100021",
      "slot_status": "OCCUPIED",
      "cargo_type": "GENERAL"
    },
    {
      "id": 2,
      "yard_area": "A区",
      "row_no": "R1",
      "bay_no": "B02",
      "tier_no": "T1",
      "container_no": "CONT-100022",
      "slot_status": "RESERVED",
      "cargo_type": "REEFER"
    },
    {
      "id": 3,
      "yard_area": "B区",
      "row_no": "R2",
      "bay_no": "B01",
      "tier_no": "T2",
      "container_no": "",
      "slot_status": "EMPTY",
      "cargo_type": "GENERAL"
    },
    {
      "id": 4,
      "yard_area": "B区",
      "row_no": "R2",
      "bay_no": "B02",
      "tier_no": "T1",
      "container_no": "CONT-200031",
      "slot_status": "LOCKED",
      "cargo_type": "DANGEROUS"
    }
  ],
  "workTask": [
    {
      "id": 1,
      "berth_plan_id": 5,
      "yard_slot_id": 1,
      "task_type": "DISCHARGE",
      "team_id": 1,
      "status": "IN_PROGRESS",
      "planned_start": "2026-09-23T08:00:00+08:00",
      "finished_at": ""
    },
    {
      "id": 2,
      "berth_plan_id": 6,
      "yard_slot_id": 2,
      "task_type": "LOAD",
      "team_id": 2,
      "status": "IN_PROGRESS",
      "planned_start": "2026-09-23T10:00:00+08:00",
      "finished_at": ""
    },
    {
      "id": 3,
      "berth_plan_id": 8,
      "yard_slot_id": 3,
      "task_type": "INSPECTION",
      "team_id": 3,
      "status": "PENDING",
      "planned_start": "2026-09-23T14:00:00+08:00",
      "finished_at": ""
    },
    {
      "id": 4,
      "berth_plan_id": 10,
      "yard_slot_id": 1,
      "task_type": "SHIFT",
      "team_id": 1,
      "status": "DONE",
      "planned_start": "2026-09-20T08:00:00+08:00",
      "finished_at": "2026-09-20T20:00:00+08:00"
    }
  ]
};
