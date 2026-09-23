import { mockData } from "../mocks/seedData";
import type { Vessel } from "../types/Vessel";

const endpoint = "/api/vessel";

export async function listVessel(): Promise<Vessel[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockData.vessel.map((row) => ({ ...row }));
}

export async function saveVessel(payload: Vessel) {
  console.info("save Vessel", payload);
  return payload;
}
