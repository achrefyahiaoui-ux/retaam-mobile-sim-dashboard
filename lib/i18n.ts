import { CategoricalKey } from "./types";

// Display order for the chart grid (independent of filter order).
// المُفعِّل is intentionally last per product request.
export const CHART_ORDER: CategoricalKey[] = [
  "المدخل",
  "مشرف الفرع",
  "الفرع",
  "المشروع",
  "الخدمة",
  "نوع الباقة",
  "المفعل",
];

export const CHART_TITLES: Record<CategoricalKey, string> = {
  "المدخل": "حسب المُدخِل",
  "المفعل": "حسب المُفعِّل",
  "مشرف الفرع": "حسب مشرف الفرع",
  "الفرع": "حسب الفرع",
  "المشروع": "حسب المشروع",
  "الخدمة": "حسب الخدمة",
  "نوع الباقة": "حسب نوع الباقة",
};

export const FILTER_LABELS = {
  "المدخل": "المُدخِل",
  "المفعل": "المُفعِّل",
  "مشرف الفرع": "مشرف الفرع",
  "الفرع": "الفرع",
  "المشروع": "المشروع",
  "الخدمة": "الخدمة",
  "نوع الباقة": "نوع الباقة",
  "التاريخ": "التاريخ",
  "الشهر": "الشهر",
  "السنة": "السنة",
} as const;

export const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export const CHART_PALETTE = [
  "#FF6B3D", // signal
  "#00C2A8", // teal
  "#FFB547", // amber
  "#A66DD4", // plum
  "#5E6BA8", // ink
  "#3DD9C2", // teal glow
  "#E5552A", // signal dark
];

export function formatNum(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
