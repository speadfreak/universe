import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = getAdmin(req as never);
  if (!admin) {
    return NextResponse.json({ ok: false, error: { code: "unauthorized", message: "Not signed in" } }, { status: 401 });
  }
  return NextResponse.json({ ok: true, data: { email: admin.email, name: admin.name, role: admin.role } });
}
