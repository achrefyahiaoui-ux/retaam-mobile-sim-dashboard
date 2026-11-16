"use client";
import { useEffect, useState } from "react";
import { formatNum } from "@/lib/i18n";

type Row = Record<string, unknown>;

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  rows: Row[];
  onConfirm: () => Promise<void>;
};

function rowLabel(row: Row): string {
  return Object.values(row)
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map(String)
    .join(" · ");
}

export function ConfirmDeleteModal({ open, onClose, title, rows, onConfirm }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      setFeedback(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setFeedback(null);
    try {
      await onConfirm();
      setFeedback({ ok: true, msg: "تم الحذف بنجاح" });
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setSubmitting(false);
      setFeedback({ ok: false, msg: err?.message ?? "فشل الحذف" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ring-ink-900/10">
        <div className="flex items-center justify-between border-b border-ink-900/8 px-4 py-3">
          <h3 className="text-base font-extrabold text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="focus-ring rounded-full bg-ink-900/5 px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-900/10"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm text-ink-800">
            سيتم حذف{" "}
            <span className="font-extrabold font-num" data-num>
              {formatNum(rows.length)}
            </span>{" "}
            {rows.length === 1 ? "عنصر" : "عناصر"}. هل أنت متأكد؟
          </p>
          <ul className="thin-scroll max-h-[40vh] space-y-1 overflow-y-auto rounded-lg bg-white p-2 ring-1 ring-ink-900/10">
            {rows.map((r, i) => (
              <li key={i} className="rounded-md px-2 py-1 text-xs text-ink-800 odd:bg-cream-100/50">
                {rowLabel(r) || "—"}
              </li>
            ))}
          </ul>
          {feedback && (
            <div
              className={`rounded-md px-3 py-2 text-xs ${
                feedback.ok ? "bg-teal/10 text-teal-dark" : "bg-red-100 text-red-800"
              }`}
            >
              {feedback.msg}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 border-t border-ink-900/8 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="focus-ring rounded-full bg-ink-900/5 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-900/10"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="focus-ring rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-red-700 disabled:bg-ink-300/40 disabled:text-ink-500 disabled:shadow-none"
            >
              {submitting ? "جاري الحذف…" : "حذف"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
