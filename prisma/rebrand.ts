/**
 * One-off rebrand migration — run with:  unset DATABASE_URL POSTGRES_URL; bun prisma/rebrand.ts
 *  1. Points the admin account at admin@gmail.com / admin_password (idempotent).
 *  2. Applies the brand accent setting (#E3202B) and the footer credit line.
 *  3. Attaches the warm service photography to each service.
 * Safe to re-run.
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  // 1 — admin credentials
  const email = "admin@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "admin_password";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    await prisma.adminUser.update({ where: { email }, data: { passwordHash: hashPassword(password), role: "super_admin", isActive: true } });
    console.log(`✓ admin refreshed: ${email}`);
  } else {
    const anyAdmin = await prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
    if (anyAdmin) {
      await prisma.adminUser.update({ where: { id: anyAdmin.id }, data: { email, passwordHash: hashPassword(password), role: "super_admin", isActive: true, name: anyAdmin.name || "Super Admin" } });
      console.log(`✓ admin repointed (${anyAdmin.email} → ${email})`);
    } else {
      await prisma.adminUser.create({ data: { email, passwordHash: hashPassword(password), name: "Super Admin", role: "super_admin" } });
      console.log(`✓ admin created: ${email}`);
    }
  }

  // 2 — settings
  await prisma.setting.upsert({ where: { key: "accentColor" }, create: { key: "accentColor", value: "#E3202B" }, update: { value: "#E3202B" } });
  await prisma.setting.upsert({ where: { key: "heroPoster" }, create: { key: "heroPoster", value: "/img/hero-poster.jpg" }, update: { value: "/img/hero-poster.jpg" } });
  console.log("✓ settings: accentColor #E3202B, heroPoster");

  // 3 — footer credit line
  const footer = await prisma.pageSection.findUnique({ where: { page_sectionKey: { page: "footer", sectionKey: "main" } } });
  if (footer && footer.data) {
    const data = footer.data as { en?: Record<string, unknown>; am?: Record<string, unknown> };
    if (data.en) data.en.creditLabel = "Developed by Joseph James";
    if (data.am) data.am.creditLabel = "በጆሴፍ ጀምስ የተሰራ";
    await prisma.pageSection.update({ where: { id: footer.id }, data: { data: data as object } });
    console.log("✓ footer credit line");
  }

  // 4 — service photography
  const images: Record<string, string> = {
    "internal-medicine-care": "/img/svc-internal-medicine-care.jpg",
    "specialist-consultations": "/img/svc-specialist-consultations.jpg",
    "laboratory-diagnostic-tests": "/img/svc-laboratory-diagnostic-tests.jpg",
    "imaging-radiology": "/img/svc-imaging-radiology.jpg",
    "patient-care-emergency": "/img/svc-patient-care-emergency.jpg",
    "digital-health-clinic-solutions": "/img/svc-digital-health-clinic-solutions.jpg",
  };
  for (const [slug, image] of Object.entries(images)) {
    const res = await prisma.service.updateMany({ where: { slug }, data: { image } });
    console.log(`${res.count ? "✓" : "·"} service ${slug} ${res.count ? "image set" : "not found (skipped)"}`);
  }

  console.log("\nRebrand migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
