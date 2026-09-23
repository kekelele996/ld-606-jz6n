// 改派结果本地持久化：离开页面/刷新后再回来仍要保留。
// 后端可用时以接口返回为准，离线评审时回落到这份快照。
const PREFIX = "port-yard:";

export function readSnapshot<T>(key: string): T[] | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

export function writeSnapshot<T>(key: string, rows: T[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  } catch {
    // 存储不可用时静默降级，页面操作仍在内存中生效
  }
}

export function clearSnapshot(key: string): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(PREFIX + key);
}
