export const formatDate = (value: string) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? "-" : new Date(value).toLocaleString("zh-CN", { hour12: false });
};
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatPercent = (value: number) => `${value}%`;
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
