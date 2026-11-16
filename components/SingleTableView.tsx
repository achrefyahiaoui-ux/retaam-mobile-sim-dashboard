"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { DataTable, rowKey } from "@/components/DataTable";
import { AddRowModal } from "@/components/AddRowModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { formatNum } from "@/lib/i18n";

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

type Props = {
  endpoint: string;
  title: string;
  accent?: "signal" | "teal" | "amber" | "plum";
  addLabel?: string;
  addTitle?: string;
  /** Enables multi-select + delete (sent to n8n with operation: "delete"). */
  deleteTitle?: string;
  description?: string;
};

async function send(endpoint: string, method: "POST" | "DELETE", body: unknown) {
  const r = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok || json?.ok === false) {
    throw new Error(json?.error || `فشل الإرسال (${r.status})`);
  }
}

export function SingleTableView({
  endpoint,
  title,
  accent = "teal",
  addLabel,
  addTitle,
  deleteTitle,
  description,
}: Props) {
  const { data, error, isLoading, mutate } = useSWR<Payload>(
    endpoint,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = data?.data ?? [];
  const cols = useMemo(() => discoverColumns(rows), [rows]);
  const canDelete = !!deleteTitle;

  // Drop selections for rows that disappeared after a refresh.
  useEffect(() => {
    if (selected.size === 0) return;
    const present = new Set(rows.map(rowKey));
    const kept = Array.from(selected).filter((k) => present.has(k));
    if (kept.length !== selected.size) setSelected(new Set(kept));
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(rowKey(r))),
    [rows, selected]
  );

  const submitAdd = async (record: Record<string, unknown>) => {
    await send(endpoint, "POST", record);
    await mutate();
  };

  const submitDelete = async () => {
    await send(endpoint, "DELETE", { items: selectedRows });
    setSelected(new Set());
    await mutate();
  };

  return (
    <div className="space-y-3">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-ink-500">{description}</div>
        <div className="flex flex-wrap items-center gap-2">
          {canDelete && selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="focus-ring rounded-full bg-ink-900/5 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-900/10"
            >
              إلغاء التحديد
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={selectedRows.length === 0}
              title={selectedRows.length === 0 ? "حدد عناصر من الجدول أولاً" : undefined}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-soft hover:bg-red-700 disabled:bg-ink-300/40 disabled:text-ink-500 disabled:shadow-none"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                <path fillRule="evenodd" d="M8 2a1 1 0 00-.94.66L6.72 4H4a1 1 0 000 2h.07l.8 10.4A2 2 0 006.86 18h6.28a2 2 0 001.99-1.6L15.93 6H16a1 1 0 100-2h-2.72l-.34-1.34A1 1 0 0012 2H8zm.5 6a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5A.75.75 0 018.5 8zm3.75.75a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" />
              </svg>
              حذف
              {selectedRows.length > 0 && (
                <span className="font-num" data-num>
                  ({formatNum(selectedRows.length)})
                </span>
              )}
            </button>
          )}
          {addLabel && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-xs font-bold text-cream-50 shadow-soft hover:bg-ink-800"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
              </svg>
              {addLabel}
            </button>
          )}
        </div>
      </div>

      <DataTable
        title={title}
        data={rows}
        isLoading={isLoading}
        error={!!error}
        accent={accent}
        selectedKeys={canDelete ? selected : undefined}
        onSelectionChange={canDelete ? setSelected : undefined}
      />

      {addLabel && (
        <AddRowModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          title={addTitle ?? addLabel}
          initialFields={cols}
          onSubmit={submitAdd}
        />
      )}

      {canDelete && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title={deleteTitle!}
          rows={selectedRows}
          onConfirm={submitDelete}
        />
      )}
    </div>
  );
}
