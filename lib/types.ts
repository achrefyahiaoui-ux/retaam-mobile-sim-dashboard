export type SimRecord = {
  "المدخل": string;
  "المفعل": string;
  "مشرف الفرع": string;
  "الفرع": string;
  "المشروع": string;
  "الخدمة": string;
  "نوع الباقة": string;
  "التاريخ": string;
  "الشهر": number;
  "السنة": number;
  "المجموع اليومي": number;
};

export type CategoricalKey =
  | "المدخل"
  | "المفعل"
  | "مشرف الفرع"
  | "الفرع"
  | "المشروع"
  | "الخدمة"
  | "نوع الباقة";

export const CATEGORICAL_KEYS: CategoricalKey[] = [
  "المدخل",
  "المفعل",
  "مشرف الفرع",
  "الفرع",
  "المشروع",
  "الخدمة",
  "نوع الباقة",
];

export type FilterState = {
  "المدخل": Set<string>;
  "المفعل": Set<string>;
  "مشرف الفرع": Set<string>;
  "الفرع": Set<string>;
  "المشروع": Set<string>;
  "الخدمة": Set<string>;
  "نوع الباقة": Set<string>;
  "التاريخ": Set<string>;
  "الشهر": Set<number>;
  "السنة": Set<number>;
  dateFrom: string | null;
  dateTo: string | null;
};

export const emptyFilterState = (): FilterState => ({
  "المدخل": new Set(),
  "المفعل": new Set(),
  "مشرف الفرع": new Set(),
  "الفرع": new Set(),
  "المشروع": new Set(),
  "الخدمة": new Set(),
  "نوع الباقة": new Set(),
  "التاريخ": new Set(),
  "الشهر": new Set(),
  "السنة": new Set(),
  dateFrom: null,
  dateTo: null,
});
