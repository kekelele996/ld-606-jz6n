import { listVessel } from "../api/Vessel";
import type { Vessel } from "../types/Vessel";

export class VesselStore {
  rows: Vessel[] = [];

  async refresh(): Promise<void> {
    this.rows = await listVessel();
  }
}

export const vesselStore = new VesselStore();
