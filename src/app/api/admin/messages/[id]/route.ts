import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = ["new", "confirmed", "completed", "cancelled"];

/** PATCH /api/admin/messages/[id] — status + notes. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const admin = requireRole(req as never, ["receptionist"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: { status?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }

  const data: { status?: string; notes?: string } = {};
  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) return jsonError("Invalid status", "validation_error", 422);
    data.status = body.status;
  }
  if (typeof body.notes === "string") data.notes = body.notes.slice(0, 4000);
  if (Object.keys(data).length === 0) return jsonError("Nothing to update");

  try {
    const updated = await db.contactMessage.update({ where: { id }, data });
    await audit(admin, "updated", "message", id, data);
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to update not found")) return jsonError("Message not found", "not_found", 404);
    return jsonError("Update failed", "server_error", 500);
  }
}

/** DELETE /api/admin/messages/[id] */
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const admin = requireRole(req as never, ["receptionist"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  try {
    await db.contactMessage.delete({ where: { id } });
    await audit(admin, "deleted", "message", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to delete does not exist")) return jsonError("Message not found", "not_found", 404);
    return jsonError("Delete failed", "server_error", 500);
  }
}
