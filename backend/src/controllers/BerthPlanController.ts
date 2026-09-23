import type { NextFunction, Request, Response } from "express";
import { berthPlanService } from "../services/BerthPlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { HttpError } from "../utils/HttpError";

export const berthPlanController = {
  list: (_req: Request, res: Response) => res.json(berthPlanService.list()),

  create: (req: Request, res: Response) => res.status(201).json(berthPlanService.create(req.body)),

  conflicts: (_req: Request, res: Response) => res.json(berthPlanService.conflicts()),

  overview: (_req: Request, res: Response) => res.json(berthPlanService.overview()),

  reassign: (req: Request, res: Response, next: NextFunction) => {
    try {
      const planId = Number(req.params.id);
      if (!Number.isFinite(planId)) {
        throw new HttpError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
      }
      res.json(berthPlanService.reassign(planId, req.body ?? {}));
    } catch (err) {
      // controller 层兜底包装：非业务异常统一转成 500，业务 HttpError 原样透传。
      next(err instanceof HttpError ? err : new HttpError(500, "INTERNAL_ERROR", (err as Error).message));
    }
  }
};
