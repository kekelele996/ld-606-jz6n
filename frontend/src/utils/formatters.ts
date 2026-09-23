import type { BerthPlan } from "../types/BerthPlan";
import type { Berth } from "../types/Berth";
import type { ConflictSeverity } from "../types/ConflictSeverity";
import { ConflictSeverityText } from "../constants/ConflictSeverity";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 卡片上只展示“MM-DD HH:mm”，避免计划卡片时间过长
export const formatPlanTime = (value: string): string => {
  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatMeters = (value: number): string => `${formatNumber(value)} m`;

export const formatSeverity = (severity: string | null): string =>
  severity ? ConflictSeverityText[severity as ConflictSeverity] ?? severity : "无冲突";

// 冲突对象文案：#计划号 · 船名（泊位）
export const formatConflictTarget = (
  plan: BerthPlan,
  plans: BerthPlan[],
  vessels: Map<number, { vessel_name: string }>,
  berths: Map<number, Berth>
): string => {
  if (plan.conflict_plan_id == null) {
    return "";
  }
  const other = plans.find((row) => row.id === plan.conflict_plan_id);
  const vesselName = other ? vessels.get(other.vessel_id)?.vessel_name ?? "未知船舶" : "未知船舶";
  const berthCode = other ? berths.get(other.berth_id)?.berth_code ?? "未知泊位" : "未知泊位";
  return `#${plan.conflict_plan_id} · ${vesselName}（${berthCode}）`;
};

export const formatReassignNote = (plan: BerthPlan, berths: Map<number, Berth>): string => {
  if (plan.reassigned_from_berth_id == null) {
    return "";
  }
  const from = berths.get(plan.reassigned_from_berth_id)?.berth_code ?? `#${plan.reassigned_from_berth_id}`;
  const to = berths.get(plan.berth_id)?.berth_code ?? `#${plan.berth_id}`;
  return `已由 ${from} 改靠 ${to}`;
};
