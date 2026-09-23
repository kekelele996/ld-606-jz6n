import type { Request, Response, NextFunction } from "express";
import { berthPlanService } from "../services/BerthPlanService";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";

export const berthPlanController = {
  list: (_req: Request, res: Response) => res.json(berthPlanService.list()),

  create: (req: Request, res: Response) => res.status(201).json(berthPlanService.create(req.body)),

  // GET /api/berth-plan/:id/candidates 候选泊位（空闲且长度合适）
  candidates: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(berthPlanService.candidates(Number(req.params.id)));
    } catch (error) {
      // controller 层再包一次业务异常，禁止全部交给全局处理器吞掉
      next(error instanceof AppError ? error : new AppError(500, ERROR_CODES.BERTH_REASSIGN_FAILED, ERROR_MESSAGES.BERTH_REASSIGN_FAILED));
    }
  },

  // PATCH /api/berth-plan/:id/reassign 调度员提交改派
  reassign: (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = berthPlanService.reassign(id, req.body);
      (req as any).auditAction = LOG_TEMPLATES.BerthPlan[4]; // BerthPlan.reassign
      (req as any).auditTarget = toAuditTarget("BerthPlan", id);
      res.json(updated);
    } catch (error) {
      next(error instanceof AppError ? error : new AppError(500, ERROR_CODES.BERTH_REASSIGN_FAILED, ERROR_MESSAGES.BERTH_REASSIGN_FAILED));
    }
  }
};
