import { seed } from "../seed";
import type { Berth } from "../models/Berth";

const rows: Berth[] = seed.berth.map((row) => ({ ...row }));

export const berthRepository = {
  findAll: (): Berth[] => rows,
  findById: (id: number): Berth | undefined => rows.find((row) => row.id === id),
  save: (row: Berth): Berth => {
    rows.push(row);
    return row;
  }
};
