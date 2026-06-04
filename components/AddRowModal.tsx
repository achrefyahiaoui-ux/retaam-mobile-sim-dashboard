"use client";
import { useEffect, useState } from "react";

type Field = { key: string; value: string };

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  initialFields: string[];
  onSubmit: (record: Record<string, unknown>) => Promise<void>;
};

export function AddRowModal({ open, onClose, title, initialFields, onSubmit }: Props) {
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
          <h3 className="text-base font-extrabold text-ink-900">{title}</h3>
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
