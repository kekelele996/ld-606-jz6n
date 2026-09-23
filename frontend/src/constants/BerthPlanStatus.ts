export const BerthPlanStatus = ["DRAFT","CONFLICT","APPROVED","BERTHING","DEPARTED","CANCELLED"] as const;
export type BerthPlanStatus = (typeof BerthPlanStatus)[number];
export const BerthPlanStatusText: Record<BerthPlanStatus, string> = {
  DRAFT: "草稿",
  CONFLICT: "冲突待处置",
  APPROVED: "已批准",
  BERTHING: "靠泊中",
  DEPARTED: "已离港",
  CANCELLED: "已取消"
};
