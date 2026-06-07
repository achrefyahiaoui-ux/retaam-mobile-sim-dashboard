"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد وكلمة المرور");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || json?.ok === false) {
        if (r.status === 401) {
          setError("البريد أو كلمة المرور غير صحيحة");
        } else {
          setError(json?.error ? `تعذر تسجيل الدخول (${json.error})` : "تعذر تسجيل الدخول");
        }
        setSubmitting(false);
        return;
      }
      router.replace(next);
    } catch (err: any) {
      setError(err?.message ?? "تعذر تسجيل الدخول");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-bold text-ink-800">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@retaam.com"
          dir="ltr"
          className="focus-ring w-full rounded-md border border-ink-900/10 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60"
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-bold text-ink-800">
          كلمة المرور
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
          className="focus-ring w-full rounded-md border border-ink-900/10 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60"
          disabled={submitting}
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-100 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="focus-ring w-full rounded-full bg-signal px-4 py-2.5 text-sm font-bold text-white shadow-glow hover:bg-signal-dark disabled:bg-ink-300/40 disabled:text-ink-500 disabled:shadow-none"
      >
        {submitting ? "جاري الدخول…" : "دخول"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ring-ink-900/10">
        <div className="flex items-center gap-3 border-b border-ink-900/8 px-5 py-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient text-cream-50 shadow-glow">
            <span className="text-lg font-extrabold">ر</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-ink-900">تسجيل الدخول</h1>
            <p className="text-[12px] text-ink-500">لوحة تحكم رتام موبايل للشرائح</p>
          </div>
        </div>
        <Suspense fallback={<div className="p-5 text-sm text-ink-500">جاري التحميل…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
