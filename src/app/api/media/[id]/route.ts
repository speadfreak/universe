import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cacheGet, cacheSet, makeEtag } from "@/lib/media-cache";

export const runtime = "nodejs";

/** GET /api/media/[id] — serves stored media bytes.
 *
 * Performance engineering for fast hero videos & media:
 *  - HTTP Range requests (206 Partial Content) → the browser starts playing
 *    as soon as the first chunks arrive and can seek without downloading the
 *    whole file. This is the single biggest win for large background videos.
 *  - Accept-Ranges + ETag + immutable cache headers → repeated visits and
 *    seeks answer from the browser/CDN cache or a cheap 304.
 *  - In-process byte cache → warm range requests never re-pull the bytea
 *    from the remote database.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ ok: false, error: { code: "not_found", message: "Invalid media id" } }, { status: 404 });
  }

  let asset: { data: Uint8Array; type: string; name: string } | null = null;
  try {
    let entry = cacheGet(id);
    if (!entry) {
      const row = await db.mediaAsset.findUnique({
        where: { id },
        select: { data: true, type: true, name: true },
      });
      if (!row) {
        return NextResponse.json({ ok: false, error: { code: "not_found", message: "Media not found" } }, { status: 404 });
      }
      const buf = Buffer.from(row.data);
      entry = {
        buf,
        type: row.type,
        name: row.name,
        etag: makeEtag(id, buf.length),
        at: Date.now(),
      };
      cacheSet(id, buf, row.type, row.name, entry.etag);
    }

    asset = { data: entry.buf, type: entry.type, name: entry.name };
    const etag = entry.etag;
    const total = asset.data.length;

    // Conditional request → cheap 304.
    const inm = req.headers.get("if-none-match");
    if (inm && inm.split(",").map((s) => s.trim()).some((s) => s === etag || s === `W/${etag}` || s === "*")) {
      return new Response(null, {
        status: 304,
        headers: {
          etag,
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }

    const baseHeaders: Record<string, string> = {
      "content-type": asset.type,
      "cache-control": "public, max-age=31536000, immutable",
      "accept-ranges": "bytes",
      etag,
      "content-disposition": `inline; filename="${encodeURIComponent(asset.name)}"`,
    };

    // ── Range request (video streaming / seeking) ──
    const rangeHeader = req.headers.get("range");
    if (rangeHeader) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
      if (m && (m[1] !== "" || m[2] !== "")) {
        let start: number;
        let end: number;
        if (m[1] === "") {
          // suffix range: last N bytes
          const suffix = Math.min(Number(m[2]), total);
          start = Math.max(0, total - suffix);
          end = total - 1;
        } else {
          start = Math.min(Number(m[1]), Math.max(0, total - 1));
          end = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1);
        }
        if (start > end || start >= total) {
          return new Response(null, {
            status: 416,
            headers: { "content-range": `bytes */${total}` },
          });
        }
        const slice = asset.data.subarray(start, end + 1);
        return new Response(new Uint8Array(slice), {
          status: 206,
          headers: {
            ...baseHeaders,
            "content-range": `bytes ${start}-${end}/${total}`,
            "content-length": String(slice.length),
          },
        });
      }
    }

    // ── Full response ──
    return new Response(new Uint8Array(asset.data), {
      status: 200,
      headers: {
        ...baseHeaders,
        "content-length": String(total),
      },
    });
  } catch (err) {
    console.error("[media] serve failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Media error" } }, { status: 500 });
  }
}
