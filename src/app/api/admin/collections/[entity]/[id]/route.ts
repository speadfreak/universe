import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ENTITIES, audit, jsonError, sanitizeEntityBody } from "@/server/admin/entities";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ entity: string; id: string }> };

/** PATCH /api/admin/collections/[entity]/[id] — partial update. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { entity, id } = await params;
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

  const { data, error } = sanitizeEntityBody(def, body, { isCreate: false });
  if (error) return jsonError(error, "validation_error", 422);
  if (Object.keys(data).length === 0) return jsonError("Nothing to update");

  try {
     
    const updated = await (db[def.model] as any).update({ where: { id }, data });
    await audit(admin, "updated", entity, id, { fields: Object.keys(data) });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to update not found")) return jsonError("Item not found", "not_found", 404);
    if (msg.includes("Unique constraint")) return jsonError("That unique value is already taken.", "conflict", 409);
    console.error(`[admin/collections/${entity}] update failed:`, err);
    return jsonError("Update failed", "server_error", 500);
  }
}

/** DELETE /api/admin/collections/[entity]/[id] */
export async function DELETE(req: Request, { params }: Ctx) {
  const { entity, id } = await params;
  const def = ENTITIES[entity];
  if (!def) return jsonError("Unknown collection", "not_found", 404);

  const admin = requireRole(req as never, def.roles);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  if (entity === "admins" && id === admin.sub) {
    return jsonError("You cannot delete your own account.", "forbidden", 403);
  }

  try {
    await (db[def.model] as unknown as { delete: (o: object) => Promise<unknown> }).delete({ where: { id } });
    await audit(admin, "deleted", entity, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to delete does not exist")) return jsonError("Item not found", "not_found", 404);
    console.error(`[admin/collections/${entity}] delete failed:`, err);
    return jsonError("Delete failed", "server_error", 500);
  }
}
