import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, zodErrorMessage } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: `Too many messages. Try again in ${limit.retryAfterSec}s.` } },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "bad_json", message: "Invalid body" } }, { status: 400 });
  }

  // honeypot: bots fill hidden fields
  if (typeof body === "object" && body !== null && "website" in body) {
    const honey = (body as { website?: unknown }).website;
    if (typeof honey === "string" && honey.trim() !== "") {
      return NextResponse.json({ ok: true, data: { id: "skipped" } }); // silently drop
    }
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "validation_error", message: zodErrorMessage(parsed.error) } },
      { status: 422 }
    );
  }

  const { website: _website, ...data } = parsed.data;
  try {
    const created = await db.contactMessage.create({ data });
    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (err) {
    console.error("[contact] create failed:", err);
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: "Could not send your message. Please call us instead." } },
      { status: 500 }
    );
  }
}
