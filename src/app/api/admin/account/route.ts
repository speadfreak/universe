import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/account — self-service account changes for the signed-in admin.
 * Body: { name?, email?, currentPassword, newPassword? }
 * Email and password changes require the current password.
 */
export async function PATCH(req: Request) {
  const admin = getAdmin(req as never);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }

  const me = await db.adminUser.findUnique({ where: { id: admin.sub } });
  if (!me || !me.isActive) return jsonError("Account not found", "not_found", 404);

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : undefined;
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const changesEmail = !!email && email !== me.email;
  const changesPassword = newPassword.length > 0;

  if (!changesEmail && !changesPassword && (name === undefined || name === me.name)) {
    return jsonError("Nothing to update");
  }
  if (changesEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email!)) {
    return jsonError("Enter a valid email address", "validation_error", 422);
  }
  if (changesPassword && newPassword.length < 8) {
    return jsonError("New password must be at least 8 characters", "validation_error", 422);
  }
  if ((changesEmail || changesPassword) && !verifyPassword(currentPassword, me.passwordHash)) {
    return jsonError("Your current password is incorrect", "forbidden", 403);
  }

  if (changesEmail) {
    const clash = await db.adminUser.findUnique({ where: { email: email! } });
    if (clash && clash.id !== me.id) {
      return jsonError("That email is already used by another admin.", "conflict", 409);
    }
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined && name.length > 0) data.name = name;
  if (changesEmail) data.email = email;
  if (changesPassword) data.passwordHash = hashPassword(newPassword);

  const updated = await db.adminUser.update({ where: { id: me.id }, data });
  await audit({ ...admin, email: (data.email as string) || admin.email }, "updated", "account", me.id, {
    fields: Object.keys(data).filter((k) => k !== "passwordHash"),
  });

  return NextResponse.json({
    ok: true,
    data: { email: updated.email, name: updated.name, role: updated.role },
  });
}
