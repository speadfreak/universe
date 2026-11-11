import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, getAdmin, signSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { audit } from "@/server/admin/entities";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} min.` } },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "bad_json", message: "Invalid body" } }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "validation_error", message: "Enter a valid email and password." } },
      { status: 422 }
    );
  }

  try {
    const user = await db.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: { code: "invalid_credentials", message: "Incorrect email or password." } },
        { status: 401 }
      );
    }

    const token = signSession({ sub: user.id, email: user.email, name: user.name, role: user.role as "super_admin" | "editor" | "receptionist" });
    await audit({ sub: user.id, email: user.email, name: user.name, role: user.role as "super_admin", exp: 0 }, "login", "admin", user.id);

    const res = NextResponse.json({
      ok: true,
      data: { email: user.email, name: user.name, role: user.role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("[admin/login] failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Login failed" } }, { status: 500 });
  }
}
