import { mockData } from "../mocks/seedData";
import type { Berth } from "../types/Berth";

const endpoint = "/api/berth";

export async function listBerth(): Promise<Berth[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockData.berth.map((row) => ({ ...row }));
}

export async function saveBerth(payload: Berth) {
  console.info("save Berth", payload);
  return payload;
}
