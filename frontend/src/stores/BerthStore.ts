import { listBerth } from "../api/Berth";
import type { Berth } from "../types/Berth";

export class BerthStore {
  rows: Berth[] = [];

  async refresh(): Promise<void> {
    this.rows = await listBerth();
  }
}

export const berthStore = new BerthStore();
