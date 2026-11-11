import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "umc_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

function secret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.POSTGRES_URL ||
    "umc-dev-secret-change-me"
  );
}

// ── passwords (scrypt) ──────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

// ── session tokens (HMAC-SHA256 "JWT") ──────────────────────────────

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "super_admin" | "editor" | "receptionist";
  exp: number;
};

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

export function signSession(
  payload: Omit<SessionPayload, "exp">
): string {
  const full: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC };
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(full));
  const sig = createHmac("sha256", secret()).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const expected = createHmac("sha256", secret()).update(`${head}.${body}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── API route guards ────────────────────────────────────────────────

export function getAdmin(req: NextRequest): SessionPayload | null {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Returns the session if the admin has one of the allowed roles, else null.
 * super_admin always passes. Roles:
 *  - editor: content + collections + media
 *  - receptionist: inbox (messages + appointments)
 */
export function requireRole(
  req: NextRequest,
  allowed: Array<SessionPayload["role"]>
): SessionPayload | null {
  const admin = getAdmin(req);
  if (!admin) return null;
  if (admin.role === "super_admin") return admin;
  if (allowed.includes(admin.role)) return admin;
  return null;
}
