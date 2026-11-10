import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/media/[id] — serves stored media bytes with long-lived cache. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ ok: false, error: { code: "not_found", message: "Invalid media id" } }, { status: 404 });
  }
  try {
    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ ok: false, error: { code: "not_found", message: "Media not found" } }, { status: 404 });
    }
    const bytes = Buffer.from(asset.data);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "content-type": asset.type,
        "content-length": String(bytes.length),
        "cache-control": "public, max-age=31536000, immutable",
        "content-disposition": `inline; filename="${encodeURIComponent(asset.name)}"`,
      },
    });
  } catch (err) {
    console.error("[media] serve failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Media error" } }, { status: 500 });
  }
}
