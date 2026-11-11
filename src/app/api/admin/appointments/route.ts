import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { jsonError, getPagination } from "@/server/admin/entities";
import type { Appointment } from "@prisma/client";

export const runtime = "nodejs";

function toCsv(rows: Appointment[]): string {
  const head = [
    "reference", "date", "time", "service", "doctor", "patient", "phone", "email", "status", "source", "notes", "created_at",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((a) =>
    [
      a.reference,
      a.date instanceof Date ? a.date.toISOString().slice(0, 10) : a.date,
      a.timeSlot,
      a.serviceName,
      a.doctorName,
      a.patientName,
      a.phone,
      a.email,
      a.status,
      a.source,
      a.notes,
      a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
    ]
      .map(esc)
      .join(",")
  );
  return [head.join(","), ...lines].join("\n");
}

/** GET /api/admin/appointments?q&status&format=csv */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["receptionist"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const status = url.searchParams.get("status") || undefined;
  const format = url.searchParams.get("format");

  const where: Record<string, unknown> = {};
  if (status && ["new", "confirmed", "completed", "cancelled"].includes(status)) where.status = status;
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { patientName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { serviceName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (format === "csv") {
    const all = await db.appointment.findMany({ where, orderBy: { createdAt: "desc" }, take: 5000 });
    return new Response(toCsv(all), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="appointments-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const { skip, take, page, pageSize } = getPagination(req as never);
  const [items, total] = await Promise.all([
    db.appointment.findMany({ where, orderBy: [{ date: "asc" }, { timeSlot: "asc" }], skip, take }),
    db.appointment.count({ where }),
  ]);

  return NextResponse.json({ ok: true, data: items, meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) } });
}
