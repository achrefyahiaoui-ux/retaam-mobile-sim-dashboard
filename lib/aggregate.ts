import { CategoricalKey, SimRecord } from "./types";

export type GroupBucket = { label: string; value: number };

export function groupSumBy(
  records: SimRecord[],
  key: CategoricalKey
): GroupBucket[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const label = (r[key] ?? "—").toString().trim() || "—";
    const v = Number(r["المجموع اليومي"]) || 0;
    map.set(label, (map.get(label) ?? 0) + v);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function uniqueValues<T>(records: SimRecord[], key: keyof SimRecord): T[] {
  const set = new Set<T>();
  for (const r of records) {
    const v = r[key] as unknown as T;
    if (v !== undefined && v !== null && v !== "") set.add(v);
  }
  return Array.from(set).sort((a: any, b: any) =>
    typeof a === "number" ? a - b : String(a).localeCompare(String(b), "ar")
  );
}

export function totalSum(records: SimRecord[]): number {
  let s = 0;
  for (const r of records) s += Number(r["المجموع اليومي"]) || 0;
  return s;
}
