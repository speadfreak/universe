import { NextResponse } from "next/server";
import { z } from "zod";
import { getHmsAdapter } from "@/server/services/local-db-adapter";

export const runtime = "nodejs";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

/** GET /api/v1/availability?date=YYYY-MM-DD */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ date: url.searchParams.get("date") || "" });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "validation_error", message: "Provide ?date=YYYY-MM-DD" } },
      { status: 422 }
    );
  }

  try {
    const adapter = getHmsAdapter();
    const availability = await adapter.getAvailability(parsed.data.date);
    return NextResponse.json({ ok: true, data: availability });
  } catch (err) {
    console.error("[v1/availability] failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Could not load availability" } }, { status: 500 });
  }
}
