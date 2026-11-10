import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/v1/services — public service list. */
export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: {
        id: true, slug: true, titleEn: true, titleAm: true,
        taglineEn: true, taglineAm: true, excerptEn: true, excerptAm: true, icon: true,
      },
    });
    return NextResponse.json({ ok: true, data: services, meta: { total: services.length } });
  } catch (err) {
    console.error("[v1/services] failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Could not load services" } }, { status: 500 });
  }
}
