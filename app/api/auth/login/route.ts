import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USERS_URL =
  process.env.RETAAM_USERS_URL ??
  "https://n8n.srv987649.hstgr.cloud/webhook/Users";

const COOKIE_NAME = "retaam_auth";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

type UserRecord = {
  email?: string;
  PW?: string | number;
  Admin?: string;
};

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "").trim();
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  let users: UserRecord[];
  try {
    const upstream = await fetch(USERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: `users_${upstream.status}` },
        { status: 502 }
      );
    }
    const raw = await upstream.json();
    users = Array.isArray(raw) ? raw : [];
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "fetch_failed" },
      { status: 502 }
    );
  }

  const match = users.find((u) => {
    const rowEmail = String(u.email ?? "").trim().toLowerCase();
    const rowPw = String(u.PW ?? "").trim();
    return rowEmail === email && rowPw === password;
  });

  if (!match) {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  const payload = {
    email: String(match.email ?? ""),
    admin: String(match.Admin ?? "").toLowerCase() === "yes",
  };
  const cookieValue = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

  const res = NextResponse.json({ ok: true, user: payload });
  res.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
