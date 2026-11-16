import { NextResponse } from "next/server";

export type Operation = "add" | "delete";

/**
 * Forwards a write to an n8n webhook. Every payload carries an `operation`
 * field ("add" | "delete") so the n8n workflow can route it with a Switch node.
 *
 * add    → { operation: "add", ...fields }
 * delete → { operation: "delete", count: n, items: [row, row, ...] }
 */
export async function forwardToWebhook(
  url: string,
  operation: Operation,
  body: unknown
) {
  let payload: Record<string, unknown>;
  if (operation === "delete") {
    const items = Array.isArray((body as any)?.items) ? (body as any).items : [];
    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "no_items" }, { status: 400 });
    }
    payload = { operation, count: items.length, items };
  } else {
    const fields =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};
    // `operation` is set last so a form field can't override it.
    payload = { ...fields, operation };
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await upstream.text();
    let response: unknown = text;
    try {
      response = JSON.parse(text);
    } catch {
      /* keep as text */
    }
    return NextResponse.json(
      { ok: upstream.ok, status: upstream.status, response },
      { status: upstream.ok ? 200 : 502 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "post_failed" },
      { status: 502 }
    );
  }
}
