"use client";
import useSWR from "swr";
import { DataTable } from "@/components/DataTable";

type Payload = { data: Record<string, unknown>[]; fetchedAt: string };

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as Payload;
  });

type Section = {
  type: "activation" | "replacement" | "renew" | "newplan";
  title: string;
  accent: "signal" | "teal" | "amber" | "plum";
  exportName: string;
};

const SECTIONS: Section[] = [
  { type: "activation",  title: "إدخالات التفعيل",     accent: "signal", exportName: "activation-entries" },
  { type: "replacement", title: "إدخالات بدل فاقد",    accent: "teal",   exportName: "replacement-entries" },
  { type: "renew",       title: "إدخالات التجديد",     accent: "amber",  exportName: "renew-entries" },
  { type: "newplan",     title: "إدخالات إضافة باقة",  accent: "plum",   exportName: "newplan-entries" },
];

function TableSection({ section }: { section: Section }) {
  const { data, error, isLoading } = useSWR<Payload>(
    `/api/entries/${section.type}`,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  return (
    <DataTable
      title={section.title}
      data={data?.data ?? []}
      isLoading={isLoading}
      error={!!error}
      accent={section.accent}
      exportFileName={section.exportName}
    />
  );
}

export function EntriesView() {
  return (
    <div className="space-y-5">
      {SECTIONS.map((s) => (
        <TableSection key={s.type} section={s} />
      ))}
    </div>
  );
}
