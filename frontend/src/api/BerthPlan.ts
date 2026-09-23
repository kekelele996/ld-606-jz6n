import { mockData } from "../mocks/seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { buildOverview, detectPlanConflicts } from "../utils/berthConflicts";
import type { BerthPlan } from "../types/BerthPlan";
import type { Berth } from "../types/Berth";
import type { Vessel } from "../types/Vessel";
import type { BerthOverview, BerthPlanConflict, ReassignPayload, ReassignResult } from "../types/Conflict";

const endpoint = "/api/berth-plan";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const mockBerthPlan = () => [...(mockData.berthPlan as unknown as BerthPlan[])];
const mockBerth = () => [...(mockData.berth as unknown as Berth[])];
const mockVessel = () => [...(mockData.vessel as unknown as Vessel[])];

export async function listBerthPlan(): Promise<BerthPlan[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockBerthPlan();
}

export async function listBerthPlanConflicts(): Promise<BerthPlanConflict[]> {
  try {
    const res = await fetch(`${endpoint}/conflicts`);
    if (res.ok) return await res.json();
  } catch {
    // 离线时按同一套规则在前端本地检测。
  }
  return detectPlanConflicts(mockBerthPlan(), mockBerth(), mockVessel());
}

export async function getBerthOverview(): Promise<BerthOverview> {
  try {
    const res = await fetch(`${endpoint}/overview`);
    if (res.ok) return await res.json();
  } catch {
    // 离线时本地汇总占用与冲突。
  }
  return buildOverview(mockBerthPlan(), mockBerth(), mockVessel());
}

// 改派是写操作，不做离线兜底：失败必须让调度员看到，避免误以为结果已保留。
export async function reassignBerthPlan(planId: number, payload: ReassignPayload): Promise<ReassignResult> {
  let res: Response;
  try {
    res = await fetch(`${endpoint}/${planId}/reassign`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-role": "dispatcher" },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new ApiError(0, "NETWORK_UNAVAILABLE", ERROR_MESSAGES.NETWORK_UNAVAILABLE);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code : "VALIDATION_FAILED";
    const message = typeof body.message === "string" && body.message ? body.message : (ERROR_MESSAGES as Record<string, string>)[code] ?? ERROR_MESSAGES.VALIDATION_FAILED;
    throw new ApiError(res.status, code, message);
  }
  return await res.json();
}

export async function saveBerthPlan(payload: BerthPlan) {
  console.info("save BerthPlan", payload);
  return payload;
}
