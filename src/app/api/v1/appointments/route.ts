import { NextResponse } from "next/server";
import { zodErrorMessage, apiAppointmentSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getHmsAdapter } from "@/server/services/local-db-adapter";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** POST /api/v1/appointments — public website booking (rate limited) or API-key/HMS booking. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const apiKey = req.headers.get("x-api-key");

  // external systems authenticate with x-api-key; the website uses rate limiting
  const external = !!process.env.HMS_API_KEY && apiKey === process.env.HMS_API_KEY;
  if (!external) {
    const limit = rateLimit(`appointments:${ip}`, 5, 10 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: { code: "rate_limited", message: `Too many requests. Try again in ${limit.retryAfterSec}s.` } },
        { status: 429, headers: { "retry-after": String(limit.retryAfterSec) } }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "bad_json", message: "Invalid body" } }, { status: 400 });
  }

  // website submissions carry a honeypot field
  if (!external && typeof body === "object" && body !== null && "website" in body) {
    const honey = (body as { website?: unknown }).website;
    if (typeof honey === "string" && honey.trim() !== "") {
      return NextResponse.json({ ok: true, data: { reference: "skipped" } });
    }
  }

  const parsed = apiAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "validation_error", message: zodErrorMessage(parsed.error) } },
      { status: 422 }
    );
  }

  try {
    const adapter = getHmsAdapter();
    const created = await adapter.createAppointment({ ...parsed.data, source: external ? "hms" : "website" });
    return NextResponse.json(
      { ok: true, data: { id: created.id, reference: created.reference, date: created.date, timeSlot: created.timeSlot, status: created.status } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[v1/appointments] create failed:", err);
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: "Could not create the appointment." } },
      { status: 500 }
    );
  }
}

/** GET /api/v1/appointments — staff/API listing (session cookie or x-api-key). */
export async function GET(req: Request) {
  const admin = getAdmin(req as never);
  const external = !!process.env.HMS_API_KEY && req.headers.get("x-api-key") === process.env.HMS_API_KEY;
  if (!admin && !external) {
    return NextResponse.json({ ok: false, error: { code: "unauthorized", message: "Authentication required" } }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10) || 20));

  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    db.appointment.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    db.appointment.count({ where }),
  ]);

  return NextResponse.json({
    ok: true,
    data: items,
    meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}
