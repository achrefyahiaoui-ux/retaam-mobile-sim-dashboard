"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { DataTable } from "@/components/DataTable";
import { AddRowModal } from "@/components/AddRowModal";

type Row = Record<string, unknown>;
type Payload = { data: Row[]; fetchedAt: string };

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as Payload;
  });

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

export function PlansView() {
  const { data, error, isLoading, mutate } = useSWR<Payload>(
    "/api/plans",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const [open, setOpen] = useState(false);
  const rows = data?.data ?? [];
  const cols = useMemo(() => discoverColumns(rows), [rows]);

  const submit = async (record: Record<string, unknown>) => {
    const r = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok || json?.ok === false) {
      throw new Error(json?.error || `فشل الإرسال (${r.status})`);
    }
    await mutate();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-ink-500">
          إدارة قائمة الباقات. يمكنك إضافة باقة جديدة وإرسالها مباشرة إلى n8n.
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-xs font-bold text-cream-50 shadow-soft hover:bg-ink-800"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
          </svg>
          إضافة باقة
        </button>
      </div>

      <DataTable
        title="قائمة الباقات"
        data={rows}
        isLoading={isLoading}
        error={!!error}
        accent="plum"
      />

      <AddRowModal
        open={open}
        onClose={() => setOpen(false)}
        title="إضافة باقة جديدة"
        initialFields={cols}
        onSubmit={submit}
      />
    </div>
  );
}
