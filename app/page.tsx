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
import { CHART_ORDER, CHART_PALETTE, CHART_TITLES, formatNum } from "@/lib/i18n";
import { parseArabicDate } from "@/lib/date";
import { EntriesView } from "@/components/EntriesView";
import { PlansView } from "@/components/PlansView";
import { SingleTableView } from "@/components/SingleTableView";

type TabKey = "dashboard" | "entries" | "plans" | "supervisors" | "sites";

type ApiPayload = { data: SimRecord[]; fetchedAt: string };

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as ApiPayload;
  });

function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function dateRange(records: SimRecord[]): { from: string | null; to: string | null } {
  let min: Date | null = null;
  let max: Date | null = null;
  for (const r of records) {
    const d = parseArabicDate(String(r["التاريخ"]));
    if (!d) continue;
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }
  return { from: min ? fmtDate(min) : null, to: max ? fmtDate(max) : null };
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useSWR<ApiPayload>(
    "/api/data",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const [filters, setFilters] = useState(emptyFilterState);
  const [tab, setTab] = useState<TabKey>("dashboard");

  const records = data?.data ?? [];
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);

  const kpis = useMemo(() => {
    const range = dateRange(filtered);
    return {
      total: totalSum(filtered),
      branches: uniqueValues<string>(filtered, "الفرع").length,
      activators: uniqueValues<string>(filtered, "المفعل").length,
      rangeFrom: range.from,
      rangeTo: range.to,
    };
  }, [filtered]);

  const rangeNode = (() => {
    if (!kpis.rangeFrom || !kpis.rangeTo) {
      return <div className="text-2xl font-extrabold">—</div>;
    }
    if (kpis.rangeFrom === kpis.rangeTo) {
      return (
        <div className="text-xl font-extrabold tracking-tight font-num" data-num>
          {kpis.rangeFrom}
        </div>
      );
    }
    return (
      <div className="space-y-0.5 font-num" data-num>
        <div className="flex items-baseline gap-1.5 text-base font-bold leading-tight">
          <span className="text-[10px] font-semibold text-ink-500">من</span>
          <span>{kpis.rangeFrom}</span>
        </div>
        <div className="flex items-baseline gap-1.5 text-base font-bold leading-tight">
          <span className="text-[10px] font-semibold text-ink-500">إلى</span>
          <span>{kpis.rangeTo}</span>
        </div>
      </div>
    );
  })();

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4 lg:p-6">
        {/* Sidebar — only on dashboard tab */}
        {tab === "dashboard" && (
          isLoading ? (
            <Skeleton className="sticky top-4 h-[calc(100vh-2rem)] w-[300px] shrink-0 no-print" />
          ) : (
            <FiltersSidebar records={records} state={filters} setState={setFilters} />
          )
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
            <div className="flex items-center gap-2">
              <div className="no-print flex items-center gap-3 rounded-full bg-cream-50/80 px-3 py-1.5 text-[11px] text-ink-700 shadow-soft ring-1 ring-ink-900/5">
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
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-[11px] font-bold text-cream-50 shadow-soft hover:bg-ink-800"
                title="طباعة الصفحة كملف PDF"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                  <path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v3h1a2 2 0 012 2v5a2 2 0 01-2 2h-1v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1H4a2 2 0 01-2-2V9a2 2 0 012-2h1V4zm2 3h6V4H7v3zm0 6h6v3H7v-3zm-2-3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                طباعة PDF
              </button>
            </div>
          </header>

          {/* Tabs */}
          <nav className="no-print flex flex-wrap items-center gap-2 border-b border-ink-900/10 pb-1">
            {([
              { k: "dashboard",   label: "لوحة التحكم" },
              { k: "entries",     label: "قاعدة الإدخالات" },
              { k: "plans",       label: "الباقات" },
              { k: "supervisors", label: "اسماء المشرفين" },
              { k: "sites",       label: "المواقع" },
            ] as { k: TabKey; label: string }[]).map((t) => {
              const active = tab === t.k;
              return (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setTab(t.k)}
                  className={`focus-ring relative rounded-t-xl px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-cream-50 text-ink-900 shadow-soft ring-1 ring-ink-900/5"
                      : "text-ink-500 hover:bg-ink-900/[0.04] hover:text-ink-800"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[2px] h-0.5 rounded-full bg-signal-gradient" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900">
              تعذر تحميل البيانات من الـ Webhook. سيتم إعادة المحاولة تلقائياً.
            </div>
          )}

          {tab === "entries" ? (
            <EntriesView />
          ) : tab === "plans" ? (
            <PlansView />
          ) : tab === "supervisors" ? (
            <SingleTableView
              endpoint="/api/entries/supervisors"
              title="اسماء المشرفين"
              accent="amber"
              addLabel="إضافة مشرف"
              addTitle="إضافة مشرف جديد"
            />
          ) : tab === "sites" ? (
            <SingleTableView
              endpoint="/api/entries/sites"
              title="المواقع"
              accent="signal"
              addLabel="إضافة موقع"
              addTitle="إضافة موقع جديد"
            />
          ) : (
          <>
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
                <KpiCard label="النطاق الزمني" value={rangeNode} accent="plum" />
              </>
            )}
          </section>

          {/* Charts */}
          <section className="print-grid-single grid grid-cols-1 gap-4 xl:grid-cols-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[320px]" />
                ))
              : CHART_ORDER.map((k, i) => (
                  <BarChartCard
                    key={k}
                    title={CHART_TITLES[k]}
                    data={groupSumBy(filtered, k)}
                    color={CHART_PALETTE[i % CHART_PALETTE.length]}
                  />
                ))}
          </section>
          </>
          )}

          <footer className="pt-2 pb-6 text-center text-[11px] text-ink-500">
            البيانات تُحدَّث تلقائياً كل 30 ثانية · مصدر البيانات: n8n Webhook
          </footer>
        </main>
      </div>
    </div>
  );
}
