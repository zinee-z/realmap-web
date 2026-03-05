export function formatPrice(val: number): string {
  if (!val) return "-";
  if (val >= 10000) return `${(val / 10000).toFixed(1)}억`;
  return `${val.toLocaleString()}만`;
}

export function formatDate(val: number): string {
  const s = String(val);
  if (s.length !== 8) return String(val);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

export function formatYearMonth(val: number): string {
  const s = String(val);
  if (s.length !== 8) return String(val);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
}

// 거래유형
export function tradeTypeLabel(val: number): string {
  const map: Record<number, string> = { 0: "직거래", 1: "중개거래" };
  return map[val] ?? "-";
}

// 매수자 유형
export function buyerTypeLabel(val: number): string {
  const map: Record<number, string> = { 0: "개인", 1: "법인", 2: "외국인" };
  return map[val] ?? "-";
}
