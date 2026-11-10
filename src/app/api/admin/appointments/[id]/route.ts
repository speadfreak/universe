import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";
import { emitWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = ["new", "confirmed", "completed", "cancelled"];

/** PATCH /api/admin/appointments/[id] — status + internal notes. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const admin = requireRole(req as never, ["receptionist"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: { status?: string; internalNotes?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }

  const data: { status?: string; internalNotes?: string } = {};
  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) return jsonError("Invalid status", "validation_error", 422);
    data.status = body.status;
  }
  if (typeof body.internalNotes === "string") data.internalNotes = body.internalNotes.slice(0, 4000);
  if (Object.keys(data).length === 0) return jsonError("Nothing to update");

  try {
    const updated = await db.appointment.update({ where: { id }, data });
    await audit(admin, "updated", "appointment", id, data);
    if (data.status === "confirmed") {
      void emitWebhook("appointment.confirmed", { reference: updated.reference, date: updated.date, timeSlot: updated.timeSlot });
    }
    if (data.status === "cancelled") {
      void emitWebhook("appointment.cancelled", { reference: updated.reference });
    }
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to update not found")) return jsonError("Appointment not found", "not_found", 404);
    return jsonError("Update failed", "server_error", 500);
  }
}

/** DELETE /api/admin/appointments/[id] */
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const admin = requireRole(req as never, ["receptionist"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  try {
    await db.appointment.delete({ where: { id } });
    await audit(admin, "deleted", "appointment", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to delete does not exist")) return jsonError("Appointment not found", "not_found", 404);
    return jsonError("Delete failed", "server_error", 500);
  }
}
