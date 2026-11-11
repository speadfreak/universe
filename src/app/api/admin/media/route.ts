import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit, jsonError, getPagination } from "@/server/admin/entities";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "video/mp4", "video/webm", "application/pdf",
]);
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

/** GET /api/admin/media — list assets (no bytes). */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  const { skip, take, page, pageSize } = getPagination(req as never);
  const [items, total] = await Promise.all([
    db.mediaAsset.findMany({
      select: { id: true, name: true, type: true, size: true, alt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip, take,
    }),
    db.mediaAsset.count(),
  ]);
  return NextResponse.json({
    ok: true,
    data: items.map((m) => ({ ...m, url: `/api/media/${m.id}` })),
    meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}

/** POST /api/admin/media — upload (multipart/form-data: file, alt, name). */
export async function POST(req: Request) {
  const admin = requireRole(req as never, ["editor"]);
  if (!admin) return jsonError("Unauthorized", "unauthorized", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Expected multipart form data");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("A file is required");
  if (!ALLOWED_TYPES.has(file.type)) return jsonError(`Unsupported file type: ${file.type || "unknown"}`, "validation_error", 422);
  if (file.size > MAX_SIZE) return jsonError("File exceeds the 25MB limit", "validation_error", 422);

  const alt = String(form.get("alt") || "").slice(0, 200);
  const name = (String(form.get("name") || "").trim() || file.name).slice(0, 120);

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const asset = await db.mediaAsset.create({
      data: { name, type: file.type, size: file.size, alt, data: bytes },
      select: { id: true, name: true, type: true, size: true, alt: true, createdAt: true },
    });
    await audit(admin, "uploaded", "media", asset.id, { name, type: file.type, size: file.size });
    return NextResponse.json({ ok: true, data: { ...asset, url: `/api/media/${asset.id}` } }, { status: 201 });
  } catch (err) {
    console.error("[admin/media] upload failed:", err);
    return jsonError("Upload failed", "server_error", 500);
  }
}
