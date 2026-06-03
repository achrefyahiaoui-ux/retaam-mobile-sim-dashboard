"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { FiltersSidebar } from "@/components/FiltersSidebar";
import { BarChartCard } from "@/components/BarChartCard";
import { KpiCard } from "@/components/KpiCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { applyFilters } from "@/lib/filter";
import { groupSumBy, totalSum, uniqueValues } from "@/lib/aggregate";
import { CATEGORICAL_KEYS, emptyFilterState, SimRecord } from "@/lib/types";
import { CHART_PALETTE, CHART_TITLES, formatNum } from "@/lib/i18n";
import { parseArabicDate } from "@/lib/date";

type ApiPayload = { data: SimRecord[]; fetchedAt: string };

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as ApiPayload;
  });

function dateRangeText(records: SimRecord[]): string {
  if (records.length === 0) return "—";
  let min: Date | null = null;
  let max: Date | null = null;
  for (const r of records) {
    const d = parseArabicDate(String(r["التاريخ"]));
    if (!d) continue;
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }
  if (!min || !max) return "—";
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return min.getTime() === max.getTime() ? fmt(min) : `${fmt(min)} — ${fmt(max)}`;
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useSWR<ApiPayload>(
    "/api/data",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const [filters, setFilters] = useState(emptyFilterState);

  const records = data?.data ?? [];
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);

  const kpis = useMemo(() => {
    return {
      total: totalSum(filtered),
      branches: uniqueValues<string>(filtered, "الفرع").length,
      activators: uniqueValues<string>(filtered, "المفعل").length,
      range: dateRangeText(filtered),
    };
  }, [filtered]);

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4 lg:p-6">
        {/* Sidebar */}
        {isLoading ? (
          <Skeleton className="sticky top-4 h-[calc(100vh-2rem)] w-[300px] shrink-0" />
        ) : (
          <FiltersSidebar records={records} state={filters} setState={setFilters} />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 space-y-5">
          {/* Header */}
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-signal-gradient text-cream-50 shadow-glow">
                  <span className="text-base font-extrabold">ر</span>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
                    لوحة تحكم رتام موبايل للشرائح
                  </h1>
                  <p className="text-[12px] text-ink-500">
                    تحليل تفعيلات الشرائح حسب المُدخِل، المُفعِّل، الفرع، المشروع، والباقة
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-cream-50/80 px-3 py-1.5 text-[11px] text-ink-700 shadow-soft ring-1 ring-ink-900/5">
              <span className={`h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-teal animate-pulse_dot"}`} />
              <span>
                {error ? "خطأ في الاتصال" : "اتصال مباشر"}
                {" · "}
                آخر تحديث: <span className="font-num" data-num>{formatTime(data?.fetchedAt)}</span>
              </span>
              <button
                type="button"
                onClick={() => mutate()}
                className="focus-ring rounded-full bg-ink-900/5 px-2.5 py-1 font-semibold text-ink-800 hover:bg-ink-900/10"
              >
                تحديث
              </button>
            </div>
          </header>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900">
              تعذر تحميل البيانات من الـ Webhook. سيتم إعادة المحاولة تلقائياً.
            </div>
          )}

          {/* KPIs */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {isLoading ? (
              <>
                <Skeleton className="h-[96px]" />
                <Skeleton className="h-[96px]" />
                <Skeleton className="h-[96px]" />
                <Skeleton className="h-[96px]" />
              </>
            ) : (
              <>
                <KpiCard label="إجمالي التفعيلات" value={kpis.total} accent="signal" hint="مجموع المُحدَّد بالفلاتر" />
                <KpiCard label="عدد الفروع" value={kpis.branches} accent="teal" />
                <KpiCard label="عدد المُفعِّلين" value={kpis.activators} accent="amber" />
                <KpiCard label="النطاق الزمني" value={kpis.range} accent="plum" />
              </>
            )}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[320px]" />
                ))
              : CATEGORICAL_KEYS.map((k, i) => (
                  <BarChartCard
                    key={k}
                    title={CHART_TITLES[k]}
                    data={groupSumBy(filtered, k)}
                    color={CHART_PALETTE[i % CHART_PALETTE.length]}
                  />
                ))}
          </section>

          <footer className="pt-2 pb-6 text-center text-[11px] text-ink-500">
            البيانات تُحدَّث تلقائياً كل 30 ثانية · مصدر البيانات: n8n Webhook
          </footer>
        </main>
      </div>
    </div>
  );
}
