import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError } from "@/server/admin/entities";
import {
  BACKDROP_SLOTS,
  serviceSlotKey,
  type BackdropFocal,
  type BackdropImage,
  type BackdropMode,
  type BackdropPublic,
} from "@/lib/backdrops";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };

const MODES: BackdropMode[] = ["single", "slideshow", "kenburns", "gradient"];
const MAX_IMAGES = 4;
const URL_MAX = 600;
const ALT_MAX = 220;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

function parseFocal(v: unknown): BackdropFocal | undefined {
  if (!v || typeof v !== "object") return undefined;
  const f = v as Record<string, unknown>;
  const x = typeof f.x === "number" && Number.isFinite(f.x) ? clamp01(f.x) : 0.5;
  const y = typeof f.y === "number" && Number.isFinite(f.y) ? clamp01(f.y) : 0.42;
  return { x, y };
}

/** Validate + sanitize the images payload; null = shape violation (reject). */
function sanitizeImages(v: unknown): BackdropImage[] | null {
  if (!Array.isArray(v)) return null;
  if (v.length > MAX_IMAGES) return null;
  const out: BackdropImage[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const img = raw as Record<string, unknown>;
    if (typeof img.url !== "string" || !img.url.trim()) return null;
    const item: BackdropImage = { url: img.url.slice(0, URL_MAX) };
    if (typeof img.alt === "string" && img.alt.trim()) item.alt = img.alt.slice(0, ALT_MAX);
    const focal = parseFocal(img.focal);
    if (focal) item.focal = focal;
    if (typeof img.mobileUrl === "string" && img.mobileUrl.trim()) item.mobileUrl = img.mobileUrl.slice(0, URL_MAX);
    const mobileFocal = parseFocal(img.mobileFocal);
    if (mobileFocal) item.mobileFocal = mobileFocal;
    out.push(item);
  }
  return out;
}

/**
 * PUT /api/admin/backdrops/[key] — save one slot's backdrop config.
 * Allowed keys: the registry (BACKDROP_SLOTS) plus "hero.service.<slug>" for
 * every service that exists in the db.
 */
export async function PUT(req: Request, { params }: Ctx) {
  const { key } = await params;
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid body");
  }

  // ── field validation ──
  const mode = body.mode;
  if (typeof mode !== "string" || !MODES.includes(mode as BackdropMode)) {
    return jsonError("mode must be one of single | slideshow | kenburns | gradient", "validation_error", 422);
  }

  const images = sanitizeImages(body.images);
  if (images === null) {
    return jsonError(`images must be an array of at most ${MAX_IMAGES} objects, each with a non-empty url`, "validation_error", 422);
  }

  const darkness = typeof body.darkness === "number" && Number.isFinite(body.darkness) ? clamp01(body.darkness) : null;
  const warmth = typeof body.warmth === "number" && Number.isFinite(body.warmth) ? clamp01(body.warmth) : null;
  if (darkness === null || warmth === null) {
    return jsonError("darkness and warmth must be numbers between 0 and 1", "validation_error", 422);
  }

  const textSide = body.textSide;
  if (textSide !== "left" && textSide !== "right") {
    return jsonError("textSide must be left or right", "validation_error", 422);
  }

  if (typeof body.parallax !== "boolean") {
    return jsonError("parallax must be a boolean", "validation_error", 422);
  }

  // ── key must be a registry slot or an existing service hero ──
  const services = await db.service.findMany({ select: { slug: true } });
  const allowed = new Set<string>(BACKDROP_SLOTS.map((s) => s.key));
  for (const sv of services) allowed.add(serviceSlotKey(sv.slug));
  if (!allowed.has(key)) return jsonError("Unknown backdrop slot", "not_found", 404);

  // An empty image list always renders the warm gradient fallback (matches lib sanitize).
  const effectiveMode: BackdropMode = images.length === 0 ? "gradient" : (mode as BackdropMode);

  const data = {
    mode: effectiveMode,
    images: images as unknown as Prisma.InputJsonValue,
    darkness,
    warmth,
    textSide,
    parallax: body.parallax,
  };

  try {
    await db.backdropSlot.upsert({ where: { key }, create: { key, ...data }, update: data });
    await audit(admin, "updated", "backdrop", key, { mode: effectiveMode });
    const config: BackdropPublic = {
      mode: effectiveMode,
      images,
      darkness,
      warmth,
      textSide,
      parallax: body.parallax,
    };
    return NextResponse.json({ ok: true, data: config });
  } catch (err) {
    console.error("[admin/backdrops] save failed:", err);
    return jsonError("Save failed", "server_error", 500);
  }
}
