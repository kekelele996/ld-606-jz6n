import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// 调度员与管理员可执行写操作，其余角色拒绝。
export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  const role = (req as { user?: { role?: string } }).user?.role ?? "readonly";
  if (roles.length === 0 || roles.includes(role)) return next();
  return res.status(403).json({ code: ERROR_CODES.RBAC_DENIED, message: ERROR_MESSAGES.RBAC_DENIED });
};
