import { listBerthPlan, listBerthPlanConflicts, getBerthOverview, reassignBerthPlan } from "../api/BerthPlan";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { BerthPlan } from "../types/BerthPlan";
import type { BerthOverview, BerthPlanConflict, ReassignPayload, ReassignResult } from "../types/Conflict";

const [, , , , LOG_CONFLICT, LOG_REASSIGN] = LOG_TEMPLATES.BerthPlan;

// 页面共享的靠泊计划数据源：每次进入页面 refresh，改派后强制刷新，
// 因此离开页面再回来时改派结果与总览占用数字都能从后端读回。
export class BerthPlanStore {
  rows: BerthPlan[] = [];
  conflicts: BerthPlanConflict[] = [];
  overview: BerthOverview | null = null;

  async refresh(): Promise<void> {
    const [rows, conflicts, overview] = await Promise.all([listBerthPlan(), listBerthPlanConflicts(), getBerthOverview()]);
    this.rows = rows;
    this.conflicts = conflicts;
    this.overview = overview;
    console.info(LOG_CONFLICT, `检出 ${conflicts.length} 条重叠`);
  }

  async reassign(planId: number, payload: ReassignPayload): Promise<ReassignResult> {
    const result = await reassignBerthPlan(planId, payload);
    console.info(LOG_REASSIGN, result.message);
    await this.refresh();
    return result;
  }
}

export const berthPlanStore = new BerthPlanStore();
