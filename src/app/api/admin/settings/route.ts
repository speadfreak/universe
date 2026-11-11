import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";
import { SETTINGS_DEFAULTS, type SiteSettings } from "@/lib/settings-defaults";
import { checkAccent } from "@/lib/color";

export const runtime = "nodejs";

const EDITABLE_KEYS = new Set<keyof SiteSettings>([
  "clinicName", "tagline", "phone", "phoneIntl", "email", "addressAddis", "addressAmbo",
  "hoursEn", "hoursAm", "heroVideo", "heroPoster", "logoUrl", "preloaderEnabled",
  "announcementEnabled", "announcementEn", "announcementAm", "seoTitle", "seoDescription",
  "defaultLocale", "accentColor", "amharicReviewFlag",
]);

/** GET /api/admin/settings */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const rows = await db.setting.findMany();
  const merged: Record<string, unknown> = { ...SETTINGS_DEFAULTS };
  for (const row of rows) {
    if (row.key === "socials") {
      merged.socials = { ...(SETTINGS_DEFAULTS.socials as Record<string, string>), ...(row.value as Record<string, string>) };
    } else {
      merged[row.key] = row.value;
    }
  }
  return NextResponse.json({ ok: true, data: merged });
}

/** PUT /api/admin/settings — partial update of known keys. */
export async function PUT(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid body");
  }

  const updates: Array<{ key: string; value: unknown }> = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === "socials" && typeof value === "object" && value !== null) {
      updates.push({ key: "socials", value: value });
      continue;
    }
    // the brand accent is contrast-checked server-side — WCAG AA is not optional
    if (key === "accentColor") {
      if (typeof value !== "string") return jsonError("accentColor must be a hex string", "validation_error", 422);
      const check = checkAccent(value);
      if (!check.valid) return jsonError(check.reason || "Inaccessible accent color", "validation_error", 422);
      updates.push({ key, value: value.toLowerCase() });
      continue;
    }
    if (!EDITABLE_KEYS.has(key as keyof SiteSettings)) continue;
    updates.push({ key, value });
  }

  if (updates.length === 0) return jsonError("No valid settings provided");

  await db.$transaction(
    updates.map((u) =>
      db.setting.upsert({ where: { key: u.key }, create: { key: u.key, value: u.value as object }, update: { value: u.value as object } })
    )
  );

  await audit(admin, "updated", "settings", "", { keys: updates.map((u) => u.key) });
  return NextResponse.json({ ok: true, data: { updated: updates.length } });
}
