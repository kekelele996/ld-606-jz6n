import { mockData } from "../mocks/seedData";
import type { BerthPlan } from "../types/BerthPlan";
import type { BerthReassignCandidate } from "../types/BerthReassignCandidate";

const endpoint = "/api/berth-plan";

export async function listBerthPlan(): Promise<BerthPlan[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockData.berthPlan.map((row) => ({ ...row }));
}

export async function saveBerthPlan(payload: BerthPlan) {
  console.info("save BerthPlan", payload);
  return payload;
}

// 候选泊位：后端按船舶长度/水深和计划时间窗判定是否空闲
export async function listReassignCandidates(planId: number): Promise<BerthReassignCandidate[]> {
  try {
    const res = await fetch(`${endpoint}/${planId}/candidates`);
    if (res.ok) return await res.json();
  } catch {
    // 离线评审时由页面用本地数据自行计算
  }
  return [];
}

export interface ReassignResult {
  ok: boolean;
  plan?: BerthPlan;
  errorCode?: string;
  message?: string;
}

// 提交改派；后端重新检测冲突，无重叠进入 APPROVED，仍重叠继续标记原因
export async function reassignBerthPlan(planId: number, berthId: number): Promise<ReassignResult> {
  try {
    const res = await fetch(`${endpoint}/${planId}/reassign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ berth_id: berthId, dispatcher_id: 1 })
    });
    if (res.ok) {
      return { ok: true, plan: await res.json() };
    }
    const body = await res.json().catch(() => ({}));
    return { ok: false, errorCode: body.code, message: body.message };
  } catch {
    return { ok: false, errorCode: "NETWORK_ERROR", message: "后端不可达" };
  }
}
