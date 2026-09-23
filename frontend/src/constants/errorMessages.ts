export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "靠泊计划不存在或已被删除",
  BERTH_NOT_FOUND: "目标泊位不存在",
  BERTH_TOO_SHORT: "目标泊位长度不足，无法承接该船舶",
  REASSIGN_STILL_CONFLICT: "改派后仍存在时间重叠，计划保持冲突状态",
  NO_ELIGIBLE_BERTH: "当前没有空闲且长度合适的泊位",
  NETWORK_UNAVAILABLE: "后端服务不可达，离线模式下改派不会被保留"
};
