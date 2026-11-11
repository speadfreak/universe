import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many attempts. Try again later." } },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "bad_json", message: "Invalid body" } }, { status: 400 });
  }

  if (typeof body === "object" && body !== null && "website" in body) {
    const honey = (body as { website?: unknown }).website;
    if (typeof honey === "string" && honey.trim() !== "") {
      return NextResponse.json({ ok: true, data: { id: "skipped" } });
    }
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "validation_error", message: "Please enter a valid email." } },
      { status: 422 }
    );
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase() },
      update: {},
    });
    return NextResponse.json({ ok: true, data: { subscribed: true } }, { status: 201 });
  } catch (err) {
    console.error("[newsletter] failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Subscription failed" } }, { status: 500 });
  }
}
