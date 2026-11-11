import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ENTITIES, audit, jsonError, sanitizeEntityBody, getPagination } from "@/server/admin/entities";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ entity: string }> };

/** GET /api/admin/collections/[entity] — list with pagination + search. */
export async function GET(req: Request, { params }: Ctx) {
  const { entity } = await params;
  const def = ENTITIES[entity];
  if (!def) return jsonError("Unknown collection", "not_found", 404);

  const admin = requireRole(req as never, def.roles);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const { skip, take, page, pageSize } = getPagination(req as never);

  const searchField = def.fields.titleEn ? "titleEn" : def.fields.nameEn ? "nameEn" : def.fields.name ? "name" : def.fields.questionEn ? "questionEn" : def.fields.title ? "title" : null;
  const where = q && searchField ? { [searchField]: { contains: q, mode: "insensitive" as const } } : {};

  // AdminUser has no `order` column — order by creation instead
  const orderBy = entity === "admins" ? [{ createdAt: "desc" as const }] : [{ order: "asc" as const }, { createdAt: "desc" as const }];

  const delegate = db[def.model] as unknown as {
    findMany: (o: object) => Promise<unknown[]>;
    count: (o: object) => Promise<number>;
  };

  const [items, total] = await Promise.all([
    delegate.findMany({ where, orderBy, skip, take }),
    delegate.count({ where }),
  ]);

  const safeItems = entity === "admins"
    ? (items as Array<Record<string, unknown>>).map(({ passwordHash: _ph, ...rest }) => rest)
    : items;

  return NextResponse.json({ ok: true, data: safeItems, meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) } });
}

/** POST /api/admin/collections/[entity] — create. */
export async function POST(req: Request, { params }: Ctx) {
  const { entity } = await params;
  const def = ENTITIES[entity];
  if (!def) return jsonError("Unknown collection", "not_found", 404);

  const admin = requireRole(req as never, def.roles);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }

  const { data, error } = sanitizeEntityBody(def, body, { isCreate: true });
  if (error) return jsonError(error, "validation_error", 422);

  try {
     
    const created = await (db[def.model] as any).create({ data });
    await audit(admin, "created", entity, (created as { id: string }).id);
    if (entity === "admins") {
      const { passwordHash: _ph, ...safe } = created as Record<string, unknown>;
      return NextResponse.json({ ok: true, data: safe }, { status: 201 });
    }
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint")) {
      return jsonError("An item with that unique value (slug/email) already exists.", "conflict", 409);
    }
    console.error(`[admin/collections/${entity}] create failed:`, err);
    return jsonError("Create failed", "server_error", 500);
  }
}
