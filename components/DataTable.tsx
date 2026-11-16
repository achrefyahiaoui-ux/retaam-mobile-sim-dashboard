"use client";
import { useMemo, useState } from "react";
import { formatNum } from "@/lib/i18n";

type Row = Record<string, unknown>;

type Props = {
  title: string;
  data: Row[];
  isLoading?: boolean;
  error?: boolean;
  accent?: "signal" | "teal" | "amber" | "plum";
  exportFileName?: string;
  /** When set, shows a trash-can button on each row. */
  onDeleteRow?: (row: Row) => void;
};

const ACCENT_BAR: Record<NonNullable<Props["accent"]>, string> = {
  signal: "bg-signal",
  teal: "bg-teal",
  amber: "bg-amber",
  plum: "bg-plum",
};

const ACCENT_CHIP: Record<NonNullable<Props["accent"]>, string> = {
  signal: "bg-signal/15 text-signal-dark",
  teal: "bg-teal/15 text-teal-dark",
  amber: "bg-amber/20 text-[#a07000]",
  plum: "bg-plum/15 text-[#7b4cb0]",
};

const ID_COL = /سيريال|رقم/;

function formatCell(v: unknown, col?: string): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    if (col && ID_COL.test(col)) return String(Math.trunc(v));
    return formatNum(v);
  }
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  return String(v);
}

function discoverColumns(rows: Row[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      if (!seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
  }
  return out;
}

export function DataTable({
  title,
  data,
  isLoading,
  error,
  accent = "signal",
  exportFileName,
  onDeleteRow,
}: Props) {
  const deletable = !!onDeleteRow;
  const columns = useMemo(() => discoverColumns(data), [data]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const activeKeys = Object.keys(filters).filter((k) => filters[k]?.trim());
    if (activeKeys.length === 0) return data;
    return data.filter((row) =>
      activeKeys.every((k) => {
        const cell = formatCell(row[k], k).toLowerCase();
        return cell.includes(filters[k].toLowerCase());
      })
    );
  }, [data, filters]);

  const setFilter = (col: string, v: string) =>
    setFilters((prev) => ({ ...prev, [col]: v }));

  const clearFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter((v) => v?.trim()).length;

  const handleExport = async () => {
    if (!exportFileName || exporting || filtered.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const aoa: unknown[][] = [columns];
      for (const row of filtered) {
        aoa.push(
          columns.map((c) => {
            const v = row[c];
            if (v === null || v === undefined) return "";
            if (typeof v === "number" || typeof v === "boolean") return v;
            return String(v);
          })
        );
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = columns.map((c) => ({
        wch: Math.min(40, Math.max(8, c.length + 2)),
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const stamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[:T]/g, "-");
      XLSX.writeFile(wb, `${exportFileName}-${stamp}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ring-ink-900/5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-900/8 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-6 w-1.5 rounded-full ${ACCENT_BAR[accent]}`} />
          <h3 className="text-sm font-extrabold text-ink-900 sm:text-base">{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold font-num ${ACCENT_CHIP[accent]}`} data-num>
            {formatNum(filtered.length)}
            {filtered.length !== data.length && ` / ${formatNum(data.length)}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="focus-ring rounded-full bg-ink-900/5 px-2.5 py-1 text-[11px] font-semibold text-ink-700 hover:bg-ink-900/10"
            >
              مسح الفلاتر ({formatNum(activeFilterCount)})
            </button>
          )}
          {exportFileName && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || filtered.length === 0}
              className="no-print focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-bold text-cream-50 shadow-soft hover:bg-ink-800 disabled:bg-ink-300/40 disabled:text-ink-500 disabled:shadow-none"
              title="تصدير إلى Excel"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden>
                <path fillRule="evenodd" d="M3 4a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm9 0v4h4l-4-4zM7.5 11a.5.5 0 01.42.23l.95 1.48.95-1.48a.5.5 0 11.84.54l-1.27 1.98 1.32 2.06a.5.5 0 11-.84.54l-.99-1.55-.99 1.55a.5.5 0 01-.84-.54l1.32-2.06-1.27-1.98A.5.5 0 017.5 11z" clipRule="evenodd" />
              </svg>
              {exporting ? "جاري التصدير…" : "تصدير Excel"}
            </button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="p-6 text-center text-sm text-ink-500">جاري التحميل…</div>
      ) : error ? (
        <div className="p-6 text-center text-sm text-red-700">تعذر تحميل البيانات</div>
      ) : data.length === 0 ? (
        <div className="p-6 text-center text-sm text-ink-500">لا توجد بيانات</div>
      ) : (
        <div className="thin-scroll max-h-[420px] overflow-auto">
          <table className="w-full border-collapse text-right text-[12px]">
            <thead className="sticky top-0 z-10 bg-cream-100">
              <tr>
                {deletable && (
                  <th
                    rowSpan={2}
                    className="no-print w-10 border-b border-ink-900/10 px-2 py-2"
                    aria-label="حذف"
                  />
                )}
                {columns.map((c) => (
                  <th
                    key={c}
                    className="border-b border-ink-900/10 px-3 py-2 text-right font-bold text-ink-900 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="border-b border-ink-900/10 bg-cream-50 px-2 py-1.5 font-normal"
                  >
                    <input
                      type="search"
                      value={filters[c] ?? ""}
                      onChange={(e) => setFilter(c, e.target.value)}
                      placeholder="بحث"
                      className="focus-ring w-full min-w-[90px] rounded-md border border-ink-900/10 bg-white px-2 py-1 text-[11px] text-ink-900 placeholder:text-ink-500/60"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                return (
                <tr
                  key={i}
                  className={`group ${i % 2 === 0 ? "bg-cream-50" : "bg-cream-100/40"}`}
                >
                  {deletable && (
                    <td className="no-print border-b border-ink-900/5 px-2 py-1 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => onDeleteRow!(row)}
                        aria-label="حذف"
                        title="حذف"
                        className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-red-500/10 hover:text-red-700"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                          <path fillRule="evenodd" d="M8 2a1 1 0 00-.94.66L6.72 4H4a1 1 0 000 2h.07l.8 10.4A2 2 0 006.86 18h6.28a2 2 0 001.99-1.6L15.93 6H16a1 1 0 100-2h-2.72l-.34-1.34A1 1 0 0012 2H8zm.5 6a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5A.75.75 0 018.5 8zm3.75.75a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  )}
                  {columns.map((c) => {
                    const v = row[c];
                    const isNum = typeof v === "number";
                    const text = formatCell(v, c);
                    return (
                      <td
                        key={c}
                        className={`border-b border-ink-900/5 px-3 py-1.5 align-middle whitespace-nowrap text-ink-800 ${
                          isNum ? "font-num" : ""
                        }`}
                        data-num={isNum ? "" : undefined}
                        title={text}
                      >
                        {text}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (deletable ? 1 : 0)}
                    className="px-3 py-6 text-center text-ink-500"
                  >
                    لا توجد نتائج مطابقة للفلاتر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
