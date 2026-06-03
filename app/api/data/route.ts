import { NextResponse } from "next/server";
import type { SimRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_URL =
  process.env.RETAAM_WEBHOOK_URL ??
  "https://n8n.srv987649.hstgr.cloud/webhook/RetaamMobileApp";

function stripQuotes(s: unknown): string {
  if (typeof s !== "string") return String(s ?? "");
  return s.replace(/^"+|"+$/g, "").trim();
}

function clean(rec: any): SimRecord {
  return {
    "المدخل": stripQuotes(rec["المدخل"]),
    "المفعل": stripQuotes(rec["المفعل"]),
    "مشرف الفرع": stripQuotes(rec["مشرف الفرع"]),
    "الفرع": stripQuotes(rec["الفرع"]),
    "المشروع": stripQuotes(rec["المشروع"]),
    "الخدمة": stripQuotes(rec["الخدمة"]),
    "نوع الباقة": stripQuotes(rec["نوع الباقة"]),
    "التاريخ": stripQuotes(rec["التاريخ"]),
    "الشهر": Number(rec["الشهر"]) || 0,
    "السنة": Number(rec["السنة"]) || 0,
    "المجموع اليومي": Number(rec["المجموع اليومي"]) || 0,
  };
}

export async function GET() {
  try {
    const upstream = await fetch(WEBHOOK_URL, {
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
    const data: SimRecord[] = arr.map(clean);
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
