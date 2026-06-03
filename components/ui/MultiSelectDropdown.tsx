"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatNum } from "@/lib/i18n";

type Props<T extends string | number> = {
  items: T[];
  selected: Set<T>;
  onToggle: (v: T) => void;
  onClear?: () => void;
  format?: (v: T) => string;
  placeholder: string;
};

export function MultiSelectDropdown<T extends string | number>({
  items,
  selected,
  onToggle,
  onClear,
  format,
  placeholder,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const qq = q.toLowerCase();
    return items.filter((it) =>
      (format ? format(it) : String(it)).toLowerCase().includes(qq)
    );
  }, [items, q, format]);

  const fmt = (it: T) => (format ? format(it) : String(it));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex w-full items-center justify-between gap-2 rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-right text-xs font-medium text-ink-800 hover:border-ink-900/30"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-ink-700">
            {selected.size === 0 ? (
              <span className="text-ink-500">{placeholder}</span>
            ) : (
              <span>
                {placeholder}
                <span className="ms-1 rounded-full bg-signal/15 px-2 py-0.5 text-[10px] font-bold text-signal-dark font-num" data-num>
                  {formatNum(selected.size)}
                </span>
              </span>
            )}
          </span>
        </span>
        <svg
          className={`h-4 w-4 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor" aria-hidden
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-card">
          <div className="border-b border-ink-900/8 p-2">
            <div className="relative">
              <svg className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث..."
                className="focus-ring w-full rounded-md border border-ink-900/10 bg-cream-50 px-3 py-1.5 ps-7 text-xs text-ink-900 placeholder:text-ink-500/70"
              />
            </div>
          </div>

          <ul role="listbox" className="thin-scroll max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-xs text-ink-500">لا توجد نتائج</li>
            )}
            {filtered.map((it, i) => {
              const isOn = selected.has(it);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onToggle(it)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-right text-xs hover:bg-cream-100 ${
                      isOn ? "bg-signal/8" : ""
                    }`}
                    role="option"
                    aria-selected={isOn}
                  >
                    <span className="truncate text-ink-900" title={fmt(it)}>{fmt(it)}</span>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isOn ? "border-signal bg-signal text-white" : "border-ink-900/25 bg-white"
                      }`}
                    >
                      {isOn && (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                          <path fillRule="evenodd" d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L8.5 12.086l6.79-6.79a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected.size > 0 && (
            <div className="flex items-center justify-between border-t border-ink-900/8 bg-cream-50 px-2 py-1.5 text-[11px]">
              <span className="text-ink-500">
                <span className="font-num" data-num>{formatNum(selected.size)}</span> محدد
              </span>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="focus-ring rounded px-2 py-0.5 font-semibold text-signal-dark hover:bg-signal/10"
                >
                  مسح
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from(selected).slice(0, 6).map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(it)}
              className="focus-ring inline-flex max-w-full items-center gap-1 truncate rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-medium text-cream-50"
              title={fmt(it)}
            >
              <span className="truncate">{fmt(it)}</span>
              <span className="text-cream-300">×</span>
            </button>
          ))}
          {selected.size > 6 && (
            <span className="rounded-full bg-ink-900/10 px-2.5 py-1 text-[11px] font-semibold text-ink-700">
              +<span className="font-num" data-num>{formatNum(selected.size - 6)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
