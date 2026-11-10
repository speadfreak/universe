import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/v1/doctors — public doctor list. */
export async function GET() {
  try {
    const doctors = await db.doctor.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: {
        id: true, nameEn: true, nameAm: true, specialtyEn: true, specialtyAm: true,
        credentials: true, languages: true, photo: true, isPlaceholder: true,
      },
    });
    return NextResponse.json({ ok: true, data: doctors, meta: { total: doctors.length } });
  } catch (err) {
    console.error("[v1/doctors] failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Could not load doctors" } }, { status: 500 });
  }
}
