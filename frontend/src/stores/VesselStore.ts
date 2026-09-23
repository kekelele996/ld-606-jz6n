import { Injectable, signal } from "@angular/core";
import { listVessel } from "../api/Vessel";
import type { Vessel } from "../types/Vessel";
import { mockData } from "../mocks/seedData";

@Injectable({ providedIn: "root" })
export class VesselStore {
  readonly rows = signal<Vessel[]>([]);
  readonly loaded = signal(false);

  async hydrate(): Promise<void> {
    const rows = await listVessel();
    this.rows.set(rows.length ? rows : mockData.vessel.map((row) => ({ ...row })));
    this.loaded.set(true);
  }
}
