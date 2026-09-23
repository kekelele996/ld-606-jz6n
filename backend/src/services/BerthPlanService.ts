import { berthPlanRepository } from "../repositories/BerthPlanRepository";
import { berthRepository } from "../repositories/BerthRepository";
import { vesselRepository } from "../repositories/VesselRepository";
import type { BerthPlan } from "../models/BerthPlan";
import type { BerthPlanReassignPayload } from "../types/BerthPlanPayload";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ConflictSeverityText } from "../constants/ConflictSeverity";
import { findOverlap, isPlanActive, toTime } from "../utils/berthConflict";

// 改派后仍重叠时写入计划的冲突原因
function buildConflictReason(berthCode: string, otherCode: string, otherId: number, minutes: number, severity: string): string {
  return `改靠 ${berthCode} 后与计划 #${otherId}（${otherCode}）时间重叠约 ${minutes} 分钟，属于${ConflictSeverityText[severity as keyof typeof ConflictSeverityText] ?? severity}冲突`;
}

// 用最新数据重算所有计划的冲突标记；DRAFT 出现重叠也会升级为 CONFLICT
function reconcileConflicts(plans: BerthPlan[]): BerthPlan[] {
  for (const plan of plans) {
    const conflict = findOverlap(plan, plans);
    if (conflict) {
      plan.status = "CONFLICT";
      plan.conflict_plan_id = conflict.otherId;
      plan.conflict_severity = conflict.severity;
      if (!plan.conflict_reason) {
        plan.conflict_reason = `与计划 #${conflict.otherId} 在同一泊位时间重叠约 ${conflict.overlapMinutes} 分钟，${ConflictSeverityText[conflict.severity]}冲突`;
      }
    } else {
      plan.conflict_plan_id = null;
      plan.conflict_severity = null;
      // 提交改派后没有重叠：CONFLICT 进入 APPROVED；普通草稿不自动审批
      if (plan.status === "CONFLICT") {
        plan.status = "APPROVED";
        plan.conflict_reason = null;
      }
    }
  }
  return plans;
}

export const berthPlanService = {
  list: () => reconcileConflicts(berthPlanRepository.findAll()),

  create: (row: unknown) => berthPlanRepository.save(row),

  // 调度员给冲突计划选择“空闲且长度合适”的泊位
  reassign: (id: number, payload: BerthPlanReassignPayload) => {
    const plan = berthPlanRepository.findById(id);
    if (!plan) {
      throw new AppError(404, ERROR_CODES.BERTH_PLAN_NOT_FOUND, ERROR_MESSAGES.BERTH_PLAN_NOT_FOUND);
    }
    const targetBerth = berthRepository.findById(Number(payload.berth_id));
    if (!targetBerth) {
      throw new AppError(404, ERROR_CODES.BERTH_NOT_FOUND, ERROR_MESSAGES.BERTH_NOT_FOUND);
    }
    const vessel = vesselRepository.findById(plan.vessel_id);
    if (!vessel) {
      throw new AppError(422, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    // 长度校验：调度员必须选择长度合适的泊位
    if (targetBerth.length_m < vessel.length_m) {
      throw new AppError(400, ERROR_CODES.BERTH_LENGTH_UNSUITABLE, ERROR_MESSAGES.BERTH_LENGTH_UNSUITABLE);
    }

    const fromBerthId = plan.berth_id;
    const now = new Date().toISOString();
    const updated = berthPlanRepository.applyReassign(id, {
      berth_id: targetBerth.id,
      reassigned_from_berth_id: fromBerthId,
      reassigned_at: now,
      reassigned_by: payload.dispatcher_id ?? plan.dispatcher_id,
      // 清空上一轮冲突原因，改派结果按新泊位重新判定
      conflict_reason: null
    });
    if (!updated) {
      throw new AppError(500, ERROR_CODES.BERTH_REASSIGN_FAILED, ERROR_MESSAGES.BERTH_REASSIGN_FAILED);
    }

    const plans = berthPlanRepository.findAll();
    const conflict = findOverlap(updated, plans);
    if (conflict) {
      const other = berthPlanRepository.findById(conflict.otherId);
      const otherBerth = other ? berthRepository.findById(other.berth_id) : undefined;
      updated.status = "CONFLICT";
      updated.conflict_plan_id = conflict.otherId;
      updated.conflict_severity = conflict.severity;
      updated.conflict_reason = buildConflictReason(
        targetBerth.berth_code,
        otherBerth?.berth_code ?? "未知泊位",
        conflict.otherId,
        conflict.overlapMinutes,
        conflict.severity
      );
    } else {
      updated.status = "APPROVED";
      updated.conflict_plan_id = null;
      updated.conflict_severity = null;
      updated.conflict_reason = null;
    }
    return updated;
  },

  // 候选泊位：长度满足船舶要求，并标注该时间窗是否空闲
  candidates: (id: number) => {
    const plan = berthPlanRepository.findById(id);
    if (!plan) {
      throw new AppError(404, ERROR_CODES.BERTH_PLAN_NOT_FOUND, ERROR_MESSAGES.BERTH_PLAN_NOT_FOUND);
    }
    const vessel = vesselRepository.findById(plan.vessel_id);
    if (!vessel) {
      throw new AppError(422, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    const plans = berthPlanRepository.findAll();
    const start = toTime(plan.planned_arrival);
    const end = toTime(plan.planned_departure);
    return berthRepository.findAll().map((berth) => {
      const suitable = berth.length_m >= vessel.length_m && berth.water_depth_m >= vessel.draft_m;
      const blocking = plans
        .filter((other) => other.id !== plan.id && other.berth_id === berth.id && isPlanActive(other))
        .find((other) => {
          const otherStart = toTime(other.planned_arrival);
          const otherEnd = toTime(other.planned_departure);
          return Math.max(start, otherStart) < Math.min(end, otherEnd);
        });
      return {
        berth_id: berth.id,
        berth_code: berth.berth_code,
        length_m: berth.length_m,
        water_depth_m: berth.water_depth_m,
        current_status: berth.current_status,
        suitable,
        free: suitable && !blocking && berth.current_status !== "MAINTENANCE",
        blocking_plan_id: blocking?.id ?? null
      };
    });
  }
};
