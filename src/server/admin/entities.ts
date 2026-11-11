import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { PrismaClient, Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import type { SessionPayload } from "@/lib/auth";

/* ── audit log ────────────────────────────────────────────── */

export async function audit(
  actor: SessionPayload | null,
  action: string,
  entity: string,
  entityId = "",
  meta?: Record<string, unknown>
) {
  try {
    await db.auditLog.create({
      data: {
        actorEmail: actor?.email || "system",
        action,
        entity,
        entityId,
        meta: (meta as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[audit] failed:", err);
  }
}

/* ── collection entity registry (generic CRUD) ────────────── */

type FieldType = "string" | "text" | "int" | "boolean" | "json" | "date";

type EntityDef = {
  label: string;
  model: keyof Pick<
    PrismaClient,
    "service" | "doctor" | "package" | "blogPost" | "testimonial" | "faq" | "galleryItem" | "branch" | "adminUser"
  >;
  roles: Array<"super_admin" | "editor" | "receptionist">;
  fields: Record<string, FieldType>;
  requiredOnCreate: string[];
  slugFrom?: string;
};

export const ENTITIES: Record<string, EntityDef> = {
  services: {
    label: "Services",
    model: "service",
    roles: ["editor"],
    fields: {
      slug: "string", icon: "string", image: "string",
      titleEn: "string", titleAm: "string", taglineEn: "string", taglineAm: "string",
      excerptEn: "text", excerptAm: "text", bodyEn: "text", bodyAm: "text",
      features: "json", process: "json", expect: "json", faqs: "json",
      order: "int", visible: "boolean",
    },
    requiredOnCreate: ["titleEn", "slug"],
  },
  doctors: {
    label: "Doctors",
    model: "doctor",
    roles: ["editor"],
    fields: {
      nameEn: "string", nameAm: "string", specialtyEn: "string", specialtyAm: "string",
      credentials: "string", bioEn: "text", bioAm: "text", languages: "string",
      photo: "string", isPlaceholder: "boolean", order: "int", visible: "boolean",
    },
    requiredOnCreate: ["nameEn", "specialtyEn"],
  },
  packages: {
    label: "Packages",
    model: "package",
    roles: ["editor"],
    fields: {
      nameEn: "string", nameAm: "string", descEn: "text", descAm: "text",
      items: "json", price: "string", featured: "boolean", order: "int", visible: "boolean",
    },
    requiredOnCreate: ["nameEn"],
  },
  posts: {
    label: "Blog posts",
    model: "blogPost",
    roles: ["editor"],
    fields: {
      slug: "string", title: "string", excerpt: "text", content: "text",
      category: "string", tags: "json", coverImage: "string", readingTime: "int",
      status: "string", publishedAt: "date", seoTitle: "string", seoDescription: "text",
    },
    requiredOnCreate: ["title"],
    slugFrom: "title",
  },
  testimonials: {
    label: "Testimonials",
    model: "testimonial",
    roles: ["editor"],
    fields: {
      name: "string", role: "string", quote: "text", rating: "int",
      photo: "string", isPlaceholder: "boolean", order: "int", visible: "boolean",
    },
    requiredOnCreate: ["name", "quote"],
  },
  faqs: {
    label: "FAQs",
    model: "faq",
    roles: ["editor"],
    fields: {
      questionEn: "string", questionAm: "string", answerEn: "text", answerAm: "text",
      category: "string", order: "int", visible: "boolean",
    },
    requiredOnCreate: ["questionEn", "answerEn"],
  },
  gallery: {
    label: "Gallery",
    model: "galleryItem",
    roles: ["editor"],
    fields: {
      title: "string", type: "string", url: "string", alt: "string", order: "int", visible: "boolean",
    },
    requiredOnCreate: ["url"],
  },
  branches: {
    label: "Branches",
    model: "branch",
    roles: ["editor"],
    fields: {
      nameEn: "string", nameAm: "string", addressEn: "text", addressAm: "text",
      phone: "string", hours: "string", hoursAm: "string", mapEmbedUrl: "string",
      established: "string", noteEn: "text", order: "int", visible: "boolean",
    },
    requiredOnCreate: ["nameEn", "addressEn"],
  },
  admins: {
    label: "Admin users",
    model: "adminUser",
    roles: ["super_admin"],
    fields: {
      email: "string", name: "string", role: "string", isActive: "boolean",
    },
    requiredOnCreate: ["email"],
  },
};

/** Validate branch map embed URLs — only Google Maps embeds allowed. */
export function validateMapEmbed(url: string): boolean {
  if (!url) return true;
  return /^https:\/\/www\.google\.com\/maps\/embed/.test(url);
}

/** Sanitize an incoming body against the entity field map. */
export function sanitizeEntityBody(
  entity: EntityDef,
  body: Record<string, unknown>,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown>; error?: string } {
  const data: Record<string, unknown> = {};

  for (const [key, type] of Object.entries(entity.fields)) {
    if (!(key in body)) continue;
    const raw = body[key];
    switch (type) {
      case "string":
      case "text":
        if (typeof raw !== "string" && raw !== null) return { data: {}, error: `${key} must be a string` };
        data[key] = typeof raw === "string" ? raw : "";
        break;
      case "int": {
        if (raw === null || raw === "") { data[key] = 0; break; }
        const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
        if (Number.isNaN(n)) return { data: {}, error: `${key} must be a number` };
        data[key] = n;
        break;
      }
      case "boolean":
        data[key] = Boolean(raw);
        break;
      case "json":
        data[key] = raw ?? [];
        break;
      case "date": {
        if (!raw) { data[key] = null; break; }
        const d = new Date(String(raw));
        if (Number.isNaN(d.getTime())) return { data: {}, error: `${key} must be a valid date` };
        data[key] = d;
        break;
      }
    }
  }

  if (entity.slugFrom) {
    const source = (data[entity.slugFrom] as string | undefined) || "";
    if (source && !data.slug) data.slug = slugify(source);
    if (data.slug) data.slug = slugify(String(data.slug));
  }

  if (entity.model === "blogPost" && isCreate && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  if (entity.model === "blogPost" && typeof data.status === "string" && !["draft", "published", "scheduled"].includes(data.status)) {
    data.status = "draft";
  }
  if (entity.model === "branch" && typeof data.mapEmbedUrl === "string" && !validateMapEmbed(data.mapEmbedUrl)) {
    return { data: {}, error: "Map URL must be a Google Maps embed link (https://www.google.com/maps/embed…)" };
  }
  if (entity.model === "adminUser") {
    if (isCreate) {
      const password = body.password;
      if (typeof password !== "string" || password.length < 8) {
        return { data: {}, error: "password must be at least 8 characters" };
      }
      data.passwordHash = hashPassword(password);
      data.email = String(data.email || "").toLowerCase().trim();
      if (!data.email) return { data: {}, error: "email is required" };
    }
    if (typeof data.role === "string" && !["super_admin", "editor", "receptionist"].includes(data.role)) {
      return { data: {}, error: "invalid role" };
    }
  }

  for (const key of entity.requiredOnCreate) {
    if (isCreate && (data[key] === undefined || data[key] === "" || data[key] === null)) {
      return { data: {}, error: `${key} is required` };
    }
  }

  return { data };
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return slug || `item-${Date.now().toString(36)}`;
}

/* ── helpers ──────────────────────────────────────────────── */

export function jsonError(message: string, code = "bad_request", status = 400) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export function getPagination(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "50", 10) || 50));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
