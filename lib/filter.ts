import { parseArabicDate } from "./date";
import { CATEGORICAL_KEYS, FilterState, SimRecord } from "./types";

export function applyFilters(
  records: SimRecord[],
  f: FilterState
): SimRecord[] {
  const fromDate = f.dateFrom ? parseArabicDate(f.dateFrom) : null;
  const toDate = f.dateTo ? parseArabicDate(f.dateTo) : null;
  return records.filter((r) => {
    for (const k of CATEGORICAL_KEYS) {
      const set = f[k];
      if (set.size > 0 && !set.has(String(r[k]))) return false;
    }
    if (f["الشهر"].size > 0 && !f["الشهر"].has(Number(r["الشهر"]))) return false;
    if (f["السنة"].size > 0 && !f["السنة"].has(Number(r["السنة"]))) return false;
    if (f["التاريخ"].size > 0 && !f["التاريخ"].has(String(r["التاريخ"]))) return false;
    if (fromDate || toDate) {
      const d = parseArabicDate(String(r["التاريخ"]));
      if (!d) return false;
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
    }
    return true;
  });
}
