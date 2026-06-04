import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE =
  process.env.RETAAM_ENTRIES_BASE ??
  "https://n8n.srv987649.hstgr.cloud/webhook";

const ENDPOINTS: Record<string, string> = {
  activation: "activation",
  replacement: "replacement",
  renew: "renew",
  newplan: "NewPaln",
};

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

export async function GET(
  _req: Request,
  ctx: { params: { type: string } }
) {
  const slug = ENDPOINTS[ctx.params.type];
  if (!slug) {
    return NextResponse.json({ error: "unknown_type" }, { status: 404 });
  }
  try {
    const upstream = await fetch(`${BASE}/${slug}`, {
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
