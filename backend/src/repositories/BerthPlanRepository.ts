import { seed } from "../seed";
import type { BerthPlan } from "../models/BerthPlan";

// 进程内可变副本：改派结果在后端运行期间保留
const rows: BerthPlan[] = seed.berthPlan.map((row) => ({ ...row }));

export const berthPlanRepository = {
  findAll: (): BerthPlan[] => rows,
  findById: (id: number): BerthPlan | undefined => rows.find((row) => row.id === id),
  save: (row: unknown) => {
    rows.push(row as BerthPlan);
    return row;
  },
  // 改派：更新泊位与冲突标记字段，返回被更新的行
  applyReassign: (id: number, patch: Partial<BerthPlan>): BerthPlan | undefined => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) {
      return undefined;
    }
    rows[index] = { ...rows[index], ...patch };
    return rows[index];
  }
};
