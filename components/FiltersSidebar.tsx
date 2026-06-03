"use client";
import { useMemo, useState } from "react";
import { CATEGORICAL_KEYS, FilterState, SimRecord } from "@/lib/types";
import { uniqueValues } from "@/lib/aggregate";
import { ARABIC_MONTHS, FILTER_LABELS, formatNum } from "@/lib/i18n";
import { fromISODateInput, toISODateInput } from "@/lib/date";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

type Props = {
  records: SimRecord[];
  state: FilterState;
  setState: (next: FilterState) => void;
};

function cloneState(s: FilterState): FilterState {
  return {
    "المدخل": new Set(s["المدخل"]),
    "المفعل": new Set(s["المفعل"]),
    "مشرف الفرع": new Set(s["مشرف الفرع"]),
    "الفرع": new Set(s["الفرع"]),
    "المشروع": new Set(s["المشروع"]),
    "الخدمة": new Set(s["الخدمة"]),
    "نوع الباقة": new Set(s["نوع الباقة"]),
    "التاريخ": new Set(s["التاريخ"]),
    "الشهر": new Set(s["الشهر"]),
    "السنة": new Set(s["السنة"]),
    dateFrom: s.dateFrom,
    dateTo: s.dateTo,
  };
}

function Section({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-900/8 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex w-full items-center justify-between px-4 py-3 text-right hover:bg-ink-900/[0.03]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[10px] font-bold text-signal-dark font-num">
              {formatNum(count)}
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor" aria-hidden
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function ChipGroup<T extends string | number>({
  items,
  selected,
  onToggle,
  format,
  search = false,
}: {
  items: T[];
  selected: Set<T>;
  onToggle: (v: T) => void;
  format?: (v: T) => string;
  search?: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!search || !q) return items;
    const qq = q.toLowerCase();
    return items.filter((it) => (format ? format(it) : String(it)).toLowerCase().includes(qq));
  }, [items, q, search, format]);

  return (
    <div className="space-y-2">
      {search && items.length > 8 && (
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث..."
          className="focus-ring w-full rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-xs text-ink-900 placeholder:text-ink-500/70"
        />
      )}
      <div className="thin-scroll flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-1 py-2 text-xs text-ink-500">لا توجد نتائج</div>
        )}
        {filtered.map((it, i) => {
          const isOn = selected.has(it);
          const label = format ? format(it) : String(it);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(it)}
              className={`focus-ring max-w-full truncate rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                isOn
                  ? "bg-ink-900 text-cream-50 shadow-sm"
                  : "bg-cream-200/60 text-ink-800 hover:bg-cream-300"
              }`}
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FiltersSidebar({ records, state, setState }: Props) {
  const categoricalOptions = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const k of CATEGORICAL_KEYS) {
      out[k] = uniqueValues<string>(records, k);
    }
    return out;
  }, [records]);

  const months = useMemo(() => uniqueValues<number>(records, "الشهر"), [records]);
  const years = useMemo(() => uniqueValues<number>(records, "السنة"), [records]);
  const dates = useMemo(() => uniqueValues<string>(records, "التاريخ"), [records]);

  const totalSelected = useMemo(() => {
    let c = 0;
    for (const k of CATEGORICAL_KEYS) c += state[k].size;
    c += state["الشهر"].size + state["السنة"].size + state["التاريخ"].size;
    if (state.dateFrom) c++;
    if (state.dateTo) c++;
    return c;
  }, [state]);

  const toggle = <T,>(key: keyof FilterState, v: T) => {
    const next = cloneState(state);
    const set = next[key] as unknown as Set<T>;
    if (set.has(v)) set.delete(v);
    else set.add(v);
    setState(next);
  };

  const clearKey = (key: keyof FilterState) => {
    const next = cloneState(state);
    (next[key] as Set<any>).clear();
    setState(next);
  };

  const reset = () => {
    setState({
      "المدخل": new Set(), "المفعل": new Set(), "مشرف الفرع": new Set(),
      "الفرع": new Set(), "المشروع": new Set(), "الخدمة": new Set(),
      "نوع الباقة": new Set(), "التاريخ": new Set(),
      "الشهر": new Set(), "السنة": new Set(),
      dateFrom: null, dateTo: null,
    });
  };

  const setDate = (which: "dateFrom" | "dateTo", iso: string) => {
    const next = cloneState(state);
    next[which] = fromISODateInput(iso);
    setState(next);
  };

  return (
    <aside className="sticky top-4 flex h-[calc(100vh-2rem)] w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl bg-cream-50/95 shadow-card ring-1 ring-ink-900/5 backdrop-blur">
      <div className="flex items-center justify-between gap-2 border-b border-ink-900/8 px-4 py-3.5">
        <div>
          <div className="text-xs font-semibold text-ink-500">الفلاتر</div>
          <div className="text-[11px] text-ink-500/80">
            <span className="font-num" data-num>{formatNum(totalSelected)}</span> محدد
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={totalSelected === 0}
          className="focus-ring rounded-full bg-signal px-3 py-1.5 text-[11px] font-bold text-white shadow-glow transition disabled:cursor-not-allowed disabled:bg-ink-300/40 disabled:shadow-none disabled:text-ink-500"
        >
          إعادة تعيين
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto">
        <Section title={FILTER_LABELS["التاريخ"]} count={(state.dateFrom ? 1 : 0) + (state.dateTo ? 1 : 0) + state["التاريخ"].size} defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px] text-ink-500">
              من
              <input
                type="date"
                value={state.dateFrom ? toISODateInput(state.dateFrom) : ""}
                onChange={(e) => setDate("dateFrom", e.target.value)}
                className="focus-ring rounded-md border border-ink-900/10 bg-white px-2 py-1 text-xs text-ink-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-ink-500">
              إلى
              <input
                type="date"
                value={state.dateTo ? toISODateInput(state.dateTo) : ""}
                onChange={(e) => setDate("dateTo", e.target.value)}
                className="focus-ring rounded-md border border-ink-900/10 bg-white px-2 py-1 text-xs text-ink-900"
              />
            </label>
          </div>
          {dates.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500/80">أو حدد تواريخ</div>
              <MultiSelectDropdown
                items={dates}
                selected={state["التاريخ"]}
                onToggle={(v) => toggle("التاريخ", v)}
                onClear={() => clearKey("التاريخ")}
                placeholder="اختر تواريخ"
              />
            </div>
          )}
        </Section>

        <Section title={FILTER_LABELS["الشهر"]} count={state["الشهر"].size}>
          <ChipGroup
            items={months}
            selected={state["الشهر"]}
            onToggle={(v) => toggle("الشهر", v)}
            format={(m) => ARABIC_MONTHS[m - 1] ?? String(m)}
          />
        </Section>

        <Section title={FILTER_LABELS["السنة"]} count={state["السنة"].size}>
          <ChipGroup
            items={years}
            selected={state["السنة"]}
            onToggle={(v) => toggle("السنة", v)}
          />
        </Section>

        {CATEGORICAL_KEYS.map((k) => (
          <Section
            key={k}
            title={FILTER_LABELS[k]}
            count={state[k].size}
          >
            {k === "المدخل" ? (
              <MultiSelectDropdown
                items={categoricalOptions[k]}
                selected={state[k]}
                onToggle={(v) => toggle(k, v)}
                onClear={() => clearKey(k)}
                placeholder="اختر المُدخِل"
              />
            ) : (
              <ChipGroup
                items={categoricalOptions[k]}
                selected={state[k]}
                onToggle={(v) => toggle(k, v)}
                search
              />
            )}
          </Section>
        ))}
      </div>
    </aside>
  );
}
