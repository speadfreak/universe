import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { jsonError } from "@/server/admin/entities";
import { BACKDROP_SLOTS, publicBackdropMap } from "@/lib/backdrops";

export const runtime = "nodejs";

/** GET /api/admin/backdrops — slot registry + merged configs (incl. per-service heroes). */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const [rows, services] = await Promise.all([
    db.backdropSlot.findMany(),
    db.service.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { slug: true, image: true, titleEn: true, titleAm: true },
    }),
  ]);

  const configs = publicBackdropMap(rows, services);
  return NextResponse.json({ ok: true, data: { slots: BACKDROP_SLOTS, configs } });
}
