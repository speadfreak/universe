import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { jsonError, getPagination } from "@/server/admin/entities";

export const runtime = "nodejs";

/** GET /api/admin/messages?q&status — inbox list. */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["receptionist"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const status = url.searchParams.get("status") || undefined;
  const { skip, take, page, pageSize } = getPagination(req as never);

  const where: Record<string, unknown> = {};
  if (status && ["new", "confirmed", "completed", "cancelled"].includes(status)) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    db.contactMessage.count({ where }),
  ]);

  return NextResponse.json({ ok: true, data: items, meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) } });
}
