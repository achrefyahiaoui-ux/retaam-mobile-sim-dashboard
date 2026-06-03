import { ReactNode } from "react";
import { formatNum } from "@/lib/i18n";

type Props = {
  label: string;
  value: number | string | ReactNode;
  hint?: string;
  accent?: "signal" | "teal" | "ink" | "amber" | "plum";
};

const ACCENTS: Record<NonNullable<Props["accent"]>, string> = {
  signal: "from-signal/15 to-signal/0 text-signal-dark",
  teal:   "from-teal/15 to-teal/0 text-teal-dark",
  ink:    "from-ink-700/15 to-ink-700/0 text-ink-800",
  amber:  "from-amber/20 to-amber/0 text-[#a07000]",
  plum:   "from-plum/15 to-plum/0 text-[#7b4cb0]",
};

const RING: Record<NonNullable<Props["accent"]>, string> = {
  signal: "ring-signal/30",
  teal:   "ring-teal/30",
  ink:    "ring-ink-700/20",
  amber:  "ring-amber/40",
  plum:   "ring-plum/30",
};

export function KpiCard({ label, value, hint, accent = "signal" }: Props) {
  const isPrimitive = typeof value === "number" || typeof value === "string";
  return (
    <div className={`kpi-card relative overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ${RING[accent]}`}>
      <div className={`absolute inset-0 bg-gradient-to-bl ${ACCENTS[accent]}`} />
      <div className="relative p-5">
        <div className="text-[13px] font-semibold text-ink-700/80">{label}</div>
        {isPrimitive ? (
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 font-num">
            {typeof value === "number" ? formatNum(value) : value}
          </div>
        ) : (
          <div className="mt-2 text-ink-900">{value}</div>
        )}
        {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
      </div>
    </div>
  );
}
