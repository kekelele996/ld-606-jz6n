import { vesselRepository } from "../repositories/VesselRepository";
import type { Vessel } from "../models/Vessel";

export const vesselService = {
  list: () => vesselRepository.findAll(),
  create: (row: Vessel) => vesselRepository.save(row)
};
