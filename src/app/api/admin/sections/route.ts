import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";

export const runtime = "nodejs";

/** GET /api/admin/sections — all editable section rows. */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const rows = await db.pageSection.findMany({ orderBy: [{ page: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json({ ok: true, data: rows });
}

/** PUT /api/admin/sections — upsert one section (page + sectionKey). */
export async function PUT(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: { page?: string; sectionKey?: string; data?: unknown; visible?: boolean; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }
  if (!body.page || !body.sectionKey || typeof body.data !== "object" || body.data === null) {
    return jsonError("page, sectionKey and data are required");
  }

  const page = String(body.page).slice(0, 40);
  const sectionKey = String(body.sectionKey).slice(0, 60);
  const data = body.data as { en?: Record<string, unknown>; am?: Record<string, unknown> };

  // basic shape validation
  for (const locale of ["en", "am"] as const) {
    const localeData = data[locale];
    if (localeData && typeof localeData !== "object") return jsonError(`data.${locale} must be an object`);
  }

  const row = await db.pageSection.upsert({
    where: { page_sectionKey: { page, sectionKey } },
    create: {
      page,
      sectionKey,
      data: data as object,
      visible: body.visible ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
    update: {
      data: data as object,
      visible: body.visible ?? undefined,
      sortOrder: body.sortOrder ?? undefined,
    },
  });

  await audit(admin, "updated", `section:${page}.${sectionKey}`, row.id);
  return NextResponse.json({ ok: true, data: row });
}
