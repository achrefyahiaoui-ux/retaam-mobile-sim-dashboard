"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { DataTable } from "@/components/DataTable";
import { AddRowModal } from "@/components/AddRowModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

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
  /** Enables a trash button per row (sent to n8n with operation: "delete"). */
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
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const rows = data?.data ?? [];
  const cols = useMemo(() => discoverColumns(rows), [rows]);
  const canDelete = !!deleteTitle;

  const submitAdd = async (record: Record<string, unknown>) => {
    await send(endpoint, "POST", record);
    await mutate();
  };

  const submitDelete = async () => {
    if (!pendingDelete) return;
    await send(endpoint, "DELETE", { items: [pendingDelete] });
    await mutate();
  };

  return (
    <div className="space-y-3">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-ink-500">{description}</div>
        <div className="flex flex-wrap items-center gap-2">
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
        onDeleteRow={canDelete ? setPendingDelete : undefined}
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
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          title={deleteTitle!}
          rows={pendingDelete ? [pendingDelete] : []}
          onConfirm={submitDelete}
        />
      )}
    </div>
  );
}
