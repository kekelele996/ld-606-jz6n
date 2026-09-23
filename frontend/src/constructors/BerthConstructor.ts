import type { Berth } from "../types/Berth";

export const createDefaultBerth = (overrides: Partial<Berth> = {}): Berth => ({
  id: 0,
  berth_code: "",
  length_m: 0,
  water_depth_m: 0,
  berth_type: "GENERAL",
  current_status: "AVAILABLE",
  safety_note: "",
  ...overrides
});

export const createBerthForm = createDefaultBerth;
export const createBerthResponse = createDefaultBerth;
