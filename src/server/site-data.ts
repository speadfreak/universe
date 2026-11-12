import { db } from "@/lib/db";
import { SETTINGS_DEFAULTS, type SiteSettings } from "@/lib/settings-defaults";
import { publicBackdropMap, type BackdropRow } from "@/lib/backdrops";
import type {
  BranchDTO, DoctorDTO, FaqDTO, GalleryDTO, PackageDTO, PostDTO, SectionRow, ServiceDTO, SiteData, TestimonialDTO,
} from "@/lib/site-types";

function asArray<T>(v: unknown, fallback: T[]): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

async function loadSettings(): Promise<SiteSettings> {
  const rows = await db.setting.findMany();
  const merged: SiteSettings = { ...SETTINGS_DEFAULTS };
  for (const row of rows) {
    const key = row.key as keyof SiteSettings;
    if (key === "socials") {
      merged.socials = { ...merged.socials, ...(row.value as Partial<SiteSettings["socials"]>) };
    } else if (key in merged) {
       
      (merged as any)[key] = row.value as any;
    }
  }
  return merged;
}

export async function getSiteData(): Promise<SiteData> {
  const [settings, sections, services, doctors, packages, posts, testimonials, faqs, gallery, branches, backdropRows] =
    await Promise.all([
      loadSettings(),
      db.pageSection.findMany({ orderBy: { sortOrder: "asc" } }),
      db.service.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.doctor.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.package.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.blogPost.findMany({
        where: { status: "published", publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: "desc" },
      }),
      db.testimonial.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.faq.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.galleryItem.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.branch.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.backdropSlot.findMany(),
    ]);

  const backdrops = publicBackdropMap(
    backdropRows as unknown as BackdropRow[],
    services.map((sv) => ({ slug: sv.slug, image: sv.image, titleEn: sv.titleEn, titleAm: sv.titleAm })),
  );

  const content: SiteData["content"] = {};
  const sectionsIndex: SiteData["sectionsIndex"] = {};
  for (const row of sections) {
    const value = row.data as { en?: object; am?: object };
    content[`${row.page}.${row.sectionKey}`] = {
       
      en: (value.en ?? {}) as any,
       
      am: (value.am ?? {}) as any,
    };
    sectionsIndex[`${row.page}.${row.sectionKey}`] = {
      visible: row.visible,
      sortOrder: row.sortOrder,
    };
  }

  const serviceDTOs: ServiceDTO[] = services.map((sv) => ({
    id: sv.id,
    slug: sv.slug,
    icon: sv.icon,
    image: sv.image,
    titleEn: sv.titleEn, titleAm: sv.titleAm,
    taglineEn: sv.taglineEn, taglineAm: sv.taglineAm,
    excerptEn: sv.excerptEn, excerptAm: sv.excerptAm,
    bodyEn: sv.bodyEn, bodyAm: sv.bodyAm,
    features: asArray(sv.features, []),
    process: asArray(sv.process, []),
    expect: asArray(sv.expect, []),
    faqs: asArray(sv.faqs, []),
  }));

  const doctorDTOs: DoctorDTO[] = doctors.map((d) => ({
    id: d.id,
    nameEn: d.nameEn, nameAm: d.nameAm,
    specialtyEn: d.specialtyEn, specialtyAm: d.specialtyAm,
    credentials: d.credentials,
    bioEn: d.bioEn, bioAm: d.bioAm,
    languages: d.languages,
    photo: d.photo,
    isPlaceholder: d.isPlaceholder,
  }));

  const packageDTOs: PackageDTO[] = packages.map((p) => ({
    id: p.id,
    nameEn: p.nameEn, nameAm: p.nameAm,
    descEn: p.descEn, descAm: p.descAm,
    items: asArray(p.items, []),
    price: p.price,
    featured: p.featured,
  }));

  const postDTOs: PostDTO[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    tags: asArray(p.tags, []),
    coverImage: p.coverImage,
    readingTime: p.readingTime,
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
  }));

  const testimonialDTOs: TestimonialDTO[] = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    quote: t.quote,
    rating: t.rating,
    photo: t.photo,
    isPlaceholder: t.isPlaceholder,
  }));

  const faqDTOs: FaqDTO[] = faqs.map((f) => ({
    id: f.id,
    questionEn: f.questionEn, questionAm: f.questionAm,
    answerEn: f.answerEn, answerAm: f.answerAm,
    category: f.category,
  }));

  const galleryDTOs: GalleryDTO[] = gallery.map((g) => ({
    id: g.id, title: g.title, type: g.type, url: g.url, alt: g.alt,
  }));

  const branchDTOs: BranchDTO[] = branches.map((b) => ({
    id: b.id,
    nameEn: b.nameEn, nameAm: b.nameAm,
    addressEn: b.addressEn, addressAm: b.addressAm,
    phone: b.phone,
    hours: b.hours, hoursAm: b.hoursAm,
    mapEmbedUrl: b.mapEmbedUrl,
    established: b.established,
    noteEn: b.noteEn,
  }));

  return {
    settings,
    content,
    sectionsIndex,
    backdrops,
    services: serviceDTOs,
    doctors: doctorDTOs,
    packages: packageDTOs,
    posts: postDTOs,
    testimonials: testimonialDTOs,
    faqs: faqDTOs,
    gallery: galleryDTOs,
    branches: branchDTOs,
  };
}
