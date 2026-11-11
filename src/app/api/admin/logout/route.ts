import { NextResponse } from "next/server";
import { SESSION_COOKIE, getAdmin } from "@/lib/auth";
import { audit } from "@/server/admin/entities";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = getAdmin(req as never);
  if (admin) await audit(admin, "logout", "admin", admin.sub);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
