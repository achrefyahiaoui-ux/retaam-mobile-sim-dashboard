"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { DataTable } from "@/components/DataTable";

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

type Field = { key: string; value: string };

function AddRowModal({
  open,
  onClose,
  initialFields,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialFields: string[];
  onSubmit: (record: Record<string, unknown>) => Promise<void>;
}) {
  const [fields, setFields] = useState<Field[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      setFields(
        initialFields.length > 0
          ? initialFields.map((k) => ({ key: k, value: "" }))
          : [{ key: "", value: "" }]
      );
      setFeedback(null);
    }
  }, [open, initialFields]);

  if (!open) return null;

  const updateField = (i: number, patch: Partial<Field>) =>
    setFields((fs) => fs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addField = () => setFields((fs) => [...fs, { key: "", value: "" }]);
  const removeField = (i: number) => setFields((fs) => fs.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const record: Record<string, unknown> = {};
    for (const f of fields) {
      const k = f.key.trim();
      if (!k) continue;
      const raw = f.value.trim();
      // Auto-coerce numerics
      if (raw !== "" && /^-?\d+(\.\d+)?$/.test(raw)) {
        record[k] = Number(raw);
      } else {
        record[k] = raw;
      }
    }
    if (Object.keys(record).length === 0) {
      setFeedback({ ok: false, msg: "أدخل حقلاً واحداً على الأقل" });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await onSubmit(record);
      setFeedback({ ok: true, msg: "تمت الإضافة بنجاح" });
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setSubmitting(false);
      setFeedback({ ok: false, msg: err?.message ?? "فشل الإرسال" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ring-ink-900/10">
        <div className="flex items-center justify-between border-b border-ink-900/8 px-4 py-3">
          <h3 className="text-base font-extrabold text-ink-900">إضافة باقة جديدة</h3>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-full bg-ink-900/5 px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-900/10"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          <div className="thin-scroll max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {fields.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="text"
                  value={f.key}
                  onChange={(e) => updateField(i, { key: e.target.value })}
                  placeholder="اسم الحقل"
                  className="focus-ring rounded-md border border-ink-900/10 bg-white px-2 py-1.5 text-xs text-ink-900 placeholder:text-ink-500/60"
                />
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => updateField(i, { value: e.target.value })}
                  placeholder="القيمة"
                  className="focus-ring rounded-md border border-ink-900/10 bg-white px-2 py-1.5 text-xs text-ink-900 placeholder:text-ink-500/60"
                />
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="focus-ring rounded-md bg-ink-900/5 px-2 text-xs font-bold text-ink-700 hover:bg-red-500/10 hover:text-red-700"
                  aria-label="حذف الحقل"
                  disabled={fields.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addField}
            className="focus-ring rounded-full bg-ink-900/5 px-3 py-1 text-[11px] font-bold text-ink-800 hover:bg-ink-900/10"
          >
            + إضافة حقل
          </button>
          {feedback && (
            <div
              className={`rounded-md px-3 py-2 text-xs ${
                feedback.ok
                  ? "bg-teal/10 text-teal-dark"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {feedback.msg}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 border-t border-ink-900/8 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-full bg-ink-900/5 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-900/10"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring rounded-full bg-signal px-4 py-1.5 text-xs font-bold text-white shadow-glow hover:bg-signal-dark disabled:bg-ink-300/40 disabled:text-ink-500 disabled:shadow-none"
            >
              {submitting ? "جاري الإرسال…" : "إرسال"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
        initialFields={cols}
        onSubmit={submit}
      />
    </div>
  );
}
