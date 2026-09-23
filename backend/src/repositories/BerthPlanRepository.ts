import { seed } from "../seed";
import type { BerthPlan } from "../models/BerthPlan";

// 进程内可变存储：改派结果在服务运行期间持续保留，页面刷新/离开后回来仍能读到。
const rows: BerthPlan[] = seed.berthPlan.map((row) => ({ ...row }));

export const berthPlanRepository = {
  findAll: (): BerthPlan[] => rows,
  findById: (id: number): BerthPlan | undefined => rows.find((row) => row.id === id),
  save: (row: BerthPlan): BerthPlan => {
    rows.push(row);
    return row;
  },
  update: (id: number, patch: Partial<BerthPlan>): BerthPlan | undefined => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch, id };
    return rows[index];
  }
};
