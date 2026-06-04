import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANS_URL =
  process.env.RETAAM_PLANS_URL ??
  "https://n8n.srv987649.hstgr.cloud/webhook-test/PlansList";

function stripQuotes(v: unknown): unknown {
  if (typeof v !== "string") return v;
  return v.replace(/^"+|"+$/g, "").trim();
}

function cleanRecord(rec: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    const key = k.replace(/^"+|"+$/g, "").trim();
    out[key] = stripQuotes(v);
  }
  return out;
}

export async function GET() {
  try {
    const upstream = await fetch(PLANS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Webhook ${upstream.status}` },
        { status: 502 }
      );
    }
    const raw = await upstream.json();
    const arr = Array.isArray(raw) ? raw : [];
    const data = arr.map((r) => cleanRecord(r as Record<string, unknown>));
    return NextResponse.json(
      { data, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "fetch_failed" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const upstream = await fetch(PLANS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await upstream.text();
    let payload: unknown = text;
    try {
      payload = JSON.parse(text);
    } catch {
      /* keep as text */
    }
    return NextResponse.json(
      { ok: upstream.ok, status: upstream.status, response: payload },
      { status: upstream.ok ? 200 : 502 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "post_failed" },
      { status: 502 }
    );
  }
}
