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

function formatCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return formatNum(v);
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

export function DataTable({ title, data, isLoading, error, accent = "signal" }: Props) {
  const columns = useMemo(() => discoverColumns(data), [data]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const activeKeys = Object.keys(filters).filter((k) => filters[k]?.trim());
    if (activeKeys.length === 0) return data;
    return data.filter((row) =>
      activeKeys.every((k) => {
        const cell = formatCell(row[k]).toLowerCase();
        return cell.includes(filters[k].toLowerCase());
      })
    );
  }, [data, filters]);

  const setFilter = (col: string, v: string) =>
    setFilters((prev) => ({ ...prev, [col]: v }));

  const clearFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter((v) => v?.trim()).length;

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
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="focus-ring rounded-full bg-ink-900/5 px-2.5 py-1 text-[11px] font-semibold text-ink-700 hover:bg-ink-900/10"
          >
            مسح الفلاتر ({formatNum(activeFilterCount)})
          </button>
        )}
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
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-cream-50" : "bg-cream-100/40"}
                >
                  {columns.map((c) => {
                    const v = row[c];
                    const isNum = typeof v === "number";
                    return (
                      <td
                        key={c}
                        className={`border-b border-ink-900/5 px-3 py-1.5 align-middle whitespace-nowrap text-ink-800 ${
                          isNum ? "font-num" : ""
                        }`}
                        data-num={isNum ? "" : undefined}
                        title={formatCell(v)}
                      >
                        {formatCell(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
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
