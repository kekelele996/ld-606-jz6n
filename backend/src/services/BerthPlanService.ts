import { berthPlanRepository } from "../repositories/BerthPlanRepository";
import { berthRepository } from "../repositories/BerthRepository";
import { vesselRepository } from "../repositories/VesselRepository";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { HttpError } from "../utils/HttpError";
import {
  buildConflictReason,
  conflictsForPlan,
  detectPlanConflicts,
  occupiedBerthIds,
  type PlanConflictEntry
} from "../utils/berthConflicts";
import type { BerthPlan } from "../models/BerthPlan";
import type { ReassignPlanPayload } from "../types/BerthPlanPayload";
import {
  createBerthOverviewDto,
  createReassignResultDto,
  type BerthOverviewDto,
  type ReassignResultDto
} from "../constructors/BerthPlanDtoFactory";

const [LOG_CREATE, , LOG_STATUS, , LOG_CONFLICT, LOG_REASSIGN] = LOG_TEMPLATES.BerthPlan;

const loadAll = () => ({
  plans: berthPlanRepository.findAll(),
  berths: berthRepository.findAll(),
  vessels: vesselRepository.findAll()
});

const currentConflicts = (): PlanConflictEntry[] => {
  const { plans, berths, vessels } = loadAll();
  return detectPlanConflicts(plans, berths, vessels);
};

// 改派后全量对账：仍重叠的 CONFLICT 计划刷新原因；已不再重叠的 CONFLICT 计划自动回到已批准。
const reconcileConflictStatuses = (entries: PlanConflictEntry[]): void => {
  const { plans } = loadAll();
  for (const plan of plans) {
    if (plan.status === "CONFLICT") {
      const mine = entries.filter((entry) => entry.plan_id === plan.id);
      if (mine.length === 0) {
        berthPlanRepository.update(plan.id, { status: "APPROVED", conflict_reason: null });
        console.info(LOG_STATUS, `plan#${plan.id} CONFLICT -> APPROVED（重叠已消除）`);
      } else {
        const first = mine[0];
        berthPlanRepository.update(plan.id, {
          conflict_reason: buildConflictReason(
            first.berth_code,
            first.other_plan_id,
            first.other_vessel_name,
            first.overlap_start,
            first.overlap_end
          )
        });
      }
    } else if (plan.status === "APPROVED" || plan.status === "DRAFT") {
      const mine = entries.filter((entry) => entry.plan_id === plan.id);
      if (mine.length > 0) {
        const first = mine[0];
        berthPlanRepository.update(plan.id, {
          status: "CONFLICT",
          conflict_reason: buildConflictReason(
            first.berth_code,
            first.other_plan_id,
            first.other_vessel_name,
            first.overlap_start,
            first.overlap_end
          )
        });
        console.info(LOG_CONFLICT, `plan#${plan.id} 检出与 plan#${first.other_plan_id} 时间重叠`);
      }
    }
  }
};

export const berthPlanService = {
  list: (): BerthPlan[] => berthPlanRepository.findAll(),

  create: (row: BerthPlan): BerthPlan => {
    console.info(LOG_CREATE, `plan#${row.id}`);
    return berthPlanRepository.save(row);
  },

  conflicts: (): PlanConflictEntry[] => currentConflicts(),

  overview: (): BerthOverviewDto => {
    const { plans, berths } = loadAll();
    const occupied = occupiedBerthIds(plans);
    const occupancy = {
      total_berths: berths.length,
      occupied_berths: occupied.size,
      occupancy_rate: berths.length === 0 ? 0 : Math.round((occupied.size / berths.length) * 1000) / 10
    };
    return createBerthOverviewDto(occupancy, currentConflicts());
  },

  reassign: (planId: number, payload: ReassignPlanPayload): ReassignResultDto => {
    const targetBerthId = Number(payload?.berth_id);
    if (!Number.isFinite(targetBerthId)) {
      throw new HttpError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    const plan = berthPlanRepository.findById(planId);
    if (!plan) {
      throw new HttpError(404, ERROR_CODES.PLAN_NOT_FOUND, ERROR_MESSAGES.PLAN_NOT_FOUND);
    }
    const berth = berthRepository.findById(targetBerthId);
    if (!berth) {
      throw new HttpError(404, ERROR_CODES.BERTH_NOT_FOUND, ERROR_MESSAGES.BERTH_NOT_FOUND);
    }
    const vessel = vesselRepository.findById(plan.vessel_id);
    if (vessel && berth.length_m < vessel.length_m) {
      throw new HttpError(
        400,
        ERROR_CODES.BERTH_TOO_SHORT,
        `${ERROR_MESSAGES.BERTH_TOO_SHORT}: 泊位 ${berth.berth_code} ${berth.length_m}m < 船舶 ${vessel.vessel_name} ${vessel.length_m}m`
      );
    }

    const dispatcherId = Number(payload?.dispatcher_id ?? plan.dispatcher_id);
    berthPlanRepository.update(plan.id, { berth_id: targetBerthId, dispatcher_id: dispatcherId });

    // 改派后重新检测：仍有重叠则保持 CONFLICT 并写明原因，否则进入已批准，并最终全量对账。
    const entries = currentConflicts();
    const remaining = conflictsForPlan(entries, plan.id);
    if (remaining.length > 0) {
      const first = remaining[0];
      const reason = buildConflictReason(
        first.berth_code,
        first.other_plan_id,
        first.other_vessel_name,
        first.overlap_start,
        first.overlap_end
      );
      berthPlanRepository.update(plan.id, { status: "CONFLICT", conflict_reason: reason });
      reconcileConflictStatuses(entries);
      console.info(LOG_REASSIGN, `plan#${plan.id} -> berth ${berth.berth_code}，仍存在重叠：${reason}`);
      const updated = berthPlanRepository.findById(plan.id) as BerthPlan;
      return createReassignResultDto(updated, conflictsForPlan(currentConflicts(), plan.id), remaining, `已改派至 ${berth.berth_code}，但仍存在时间重叠：${reason}`);
    }

    berthPlanRepository.update(plan.id, { status: "APPROVED", conflict_reason: null });
    reconcileConflictStatuses(entries);
    console.info(LOG_REASSIGN, `plan#${plan.id} -> berth ${berth.berth_code}，无重叠，已批准`);
    const updated = berthPlanRepository.findById(plan.id) as BerthPlan;
    return createReassignResultDto(updated, [], [], `已改派至 ${berth.berth_code}，无时间重叠，计划已批准`);
  }
};
