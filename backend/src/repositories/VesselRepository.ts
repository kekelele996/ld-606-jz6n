import { seed } from "../seed";
import type { Vessel } from "../models/Vessel";

const rows: Vessel[] = seed.vessel.map((row) => ({ ...row }));

export const vesselRepository = {
  findAll: (): Vessel[] => rows,
  findById: (id: number): Vessel | undefined => rows.find((row) => row.id === id),
  save: (row: unknown) => {
    rows.push(row as Vessel);
    return row;
  }
};
