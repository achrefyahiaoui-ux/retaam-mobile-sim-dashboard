"use client";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GroupBucket } from "@/lib/aggregate";
import { formatNum } from "@/lib/i18n";

type Props = {
  title: string;
  data: GroupBucket[];
  color: string;
  initialLimit?: number;
};

function truncate(s: string, n = 22) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function BarChartCard({ title, data, color, initialLimit = 15 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const shown = useMemo(
    () => (expanded ? data : data.slice(0, initialLimit)),
    [data, expanded, initialLimit]
  );

  const chartData = useMemo(
    () =>
      shown.map((d) => ({
        ...d,
        labelShort: truncate(d.label),
      })),
    [shown]
  );

  const total = useMemo(() => data.reduce((s, b) => s + b.value, 0), [data]);
  const max = useMemo(() => (data[0]?.value ?? 0), [data]);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-cream-50/95 shadow-card ring-1 ring-ink-900/5">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-base font-bold text-ink-900">{title}</h3>
          <p className="mt-0.5 text-[11px] text-ink-500">
            <span className="font-num" data-num>{formatNum(data.length)}</span> فئة ·
            الإجمالي <span className="font-num" data-num>{formatNum(total)}</span>
          </p>
        </div>
        {data.length > initialLimit && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="focus-ring rounded-full bg-ink-900/5 px-3 py-1 text-[11px] font-semibold text-ink-800 hover:bg-ink-900/10"
          >
            {expanded ? "عرض الأعلى فقط" : "عرض الكل"}
          </button>
        )}
      </div>

      <div className="px-2 pb-3 pt-2">
        {data.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-ink-500">
            لا توجد بيانات لعرضها
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(260, shown.length * 28 + 40)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 36, left: 8, bottom: 8 }}
              barCategoryGap={6}
            >
              <CartesianGrid horizontal={false} stroke="rgba(15,21,53,0.06)" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatNum(v as number)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="labelShort"
                width={140}
                tick={{ fontSize: 12, fill: "#1A2150" }}
                axisLine={false}
                tickLine={false}
                orientation="right"
              />
              <Tooltip
                cursor={{ fill: "rgba(15,21,53,0.04)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(15,21,53,0.10)",
                  background: "white",
                  boxShadow: "0 12px 32px -8px rgba(15,21,53,0.18)",
                  fontFamily: "var(--font-cairo)",
                  fontSize: 12,
                }}
                formatter={(v: any) => [formatNum(Number(v)), "المجموع"]}
                labelFormatter={(_, payload) =>
                  (payload?.[0]?.payload?.label as string) ?? ""
                }
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 6, 6]}
                label={{
                  position: "insideRight",
                  fill: "#FBF8F1",
                  fontSize: 11,
                  fontFamily: "var(--font-dm)",
                  formatter: (v: any) => formatNum(Number(v)),
                }}
              >
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={color}
                    fillOpacity={0.55 + 0.45 * (d.value / (max || 1))}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
