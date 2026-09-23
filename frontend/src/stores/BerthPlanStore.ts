import { Injectable, signal } from "@angular/core";
import { listBerthPlan, reassignBerthPlan } from "../api/BerthPlan";
import type { BerthPlan } from "../types/BerthPlan";
import { mockData } from "../mocks/seedData";
import { readSnapshot, writeSnapshot } from "../utils/storage";
import { findOverlap, reconcileConflicts } from "../utils/berthConflict";
import { ConflictSeverityText } from "../constants/ConflictSeverity";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const STORAGE_KEY = "berthPlan";

function clone(rows: BerthPlan[]): BerthPlan[] {
  return rows.map((row) => ({ ...row }));
}

// 后端不可达时的本地改派：同样执行长度校验与冲突复检，保证离线评审体验一致
function localBuildReason(plans: BerthPlan[], plan: BerthPlan, targetCode: string): BerthPlan {
  const conflict = findOverlap(plan, plans);
  if (conflict) {
    return {
      ...plan,
      status: "CONFLICT",
      conflict_plan_id: conflict.otherId,
      conflict_severity: conflict.severity,
      conflict_reason: `改靠 ${targetCode} 后与计划 #${conflict.otherId}（${targetCode}）时间重叠约 ${conflict.overlapMinutes} 分钟，属于${ConflictSeverityText[conflict.severity]}冲突`
    };
  }
  return { ...plan, status: "APPROVED", conflict_plan_id: null, conflict_severity: null, conflict_reason: null };
}

@Injectable({ providedIn: "root" })
export class BerthPlanStore {
  readonly rows = signal<BerthPlan[]>([]);
  readonly loaded = signal(false);
  readonly submitting = signal(false);

  async hydrate(): Promise<void> {
    const snapshot = readSnapshot<BerthPlan>(STORAGE_KEY);
    if (snapshot && snapshot.length) {
      this.rows.set(reconcileConflicts(snapshot));
      this.loaded.set(true);
      return;
    }
    const rows = await listBerthPlan();
    this.persist(reconcileConflicts(rows.length ? rows : clone(mockData.berthPlan)));
    this.loaded.set(true);
  }

  private persist(rows: BerthPlan[]): void {
    this.rows.set(rows);
    writeSnapshot(STORAGE_KEY, rows);
  }

  getById(id: number): BerthPlan | undefined {
    return this.rows().find((row) => row.id === id);
  }

  // 提交改派：优先走后端，离线时回落到本地同口径复检
  async reassign(
    id: number,
    berthId: number,
    berthCode: string,
    vesselLength: number,
    berthLength: number
  ): Promise<{ ok: boolean; message?: string }> {
    if (berthLength < vesselLength) {
      return { ok: false, message: ERROR_MESSAGES.BERTH_LENGTH_UNSUITABLE };
    }
    this.submitting.set(true);
    try {
      const result = await reassignBerthPlan(id, berthId);
      if (result.ok && result.plan) {
        const next = this.rows().map((row) => (row.id === id ? result.plan! : row));
        this.persist(reconcileConflicts(next));
        console.info(LOG_TEMPLATES.BerthPlan[4], id, "->", berthId);
        return { ok: true };
      }
      if (result.errorCode && result.errorCode !== "NETWORK_ERROR") {
        return { ok: false, message: result.message };
      }
      // NETWORK_ERROR：本地回退
      const rows = this.rows();
      const plan = rows.find((row) => row.id === id);
      if (!plan) {
        return { ok: false, message: ERROR_MESSAGES.BERTH_PLAN_NOT_FOUND };
      }
      const moved: BerthPlan = {
        ...plan,
        berth_id: berthId,
        reassigned_from_berth_id: plan.berth_id,
        reassigned_at: new Date().toISOString(),
        reassigned_by: plan.dispatcher_id,
        conflict_reason: null
      };
      const nextRows = rows.map((row) => (row.id === id ? moved : row));
      const checked = nextRows.map((row) => (row.id === id ? localBuildReason(nextRows, moved, berthCode) : row));
      this.persist(reconcileConflicts(checked));
      return { ok: true };
    } finally {
      this.submitting.set(false);
    }
  }
}
