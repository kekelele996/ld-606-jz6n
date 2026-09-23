import { Injectable, signal } from "@angular/core";
import { listBerth } from "../api/Berth";
import type { Berth } from "../types/Berth";
import { mockData } from "../mocks/seedData";

@Injectable({ providedIn: "root" })
export class BerthStore {
  readonly rows = signal<Berth[]>([]);
  readonly loaded = signal(false);

  async hydrate(): Promise<void> {
    const rows = await listBerth();
    this.rows.set(rows.length ? rows : mockData.berth.map((row) => ({ ...row })));
    this.loaded.set(true);
  }
}
