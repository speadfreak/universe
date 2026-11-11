import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/media/[id] — rename / alt text. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: { name?: string; alt?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }

  const data: { name?: string; alt?: string } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim().slice(0, 120);
  if (typeof body.alt === "string") data.alt = body.alt.slice(0, 200);
  if (Object.keys(data).length === 0) return jsonError("Nothing to update");

  try {
    const updated = await db.mediaAsset.update({
      where: { id },
      data,
      select: { id: true, name: true, type: true, size: true, alt: true, createdAt: true },
    });
    await audit(admin, "updated", "media", id, data);
    return NextResponse.json({ ok: true, data: { ...updated, url: `/api/media/${updated.id}` } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to update not found")) return jsonError("Media not found", "not_found", 404);
    return jsonError("Update failed", "server_error", 500);
  }
}

/** DELETE /api/admin/media/[id] */
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  try {
    await db.mediaAsset.delete({ where: { id } });
    await audit(admin, "deleted", "media", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to delete does not exist")) return jsonError("Media not found", "not_found", 404);
    return jsonError("Delete failed", "server_error", 500);
  }
}
