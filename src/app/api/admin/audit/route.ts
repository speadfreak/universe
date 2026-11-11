import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { jsonError, getPagination } from "@/server/admin/entities";

export const runtime = "nodejs";

/** GET /api/admin/audit — audit trail (super admin only). */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["super_admin"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const { skip, take, page, pageSize } = getPagination(req as never);
  const [items, total] = await Promise.all([
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip, take }),
    db.auditLog.count(),
  ]);

  return NextResponse.json({ ok: true, data: items, meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) } });
}
