import type { SiteSettings } from "@/lib/settings-defaults";
import type { SectionData } from "@/lib/content-schema";

export type Localized = { en: string; am: string };

export type ServiceDTO = {
  id: string;
  slug: string;
  icon: string;
  image: string;
  titleEn: string; titleAm: string;
  taglineEn: string; taglineAm: string;
  excerptEn: string; excerptAm: string;
  bodyEn: string; bodyAm: string;
  features: Array<{ en: string; am: string }>;
  process: Array<{ en: string; am: string }>;
  expect: Array<{ en: string; am: string }>;
  faqs: Array<{ q: Localized; a: Localized }>;
};

export type DoctorDTO = {
  id: string;
  nameEn: string; nameAm: string;
  specialtyEn: string; specialtyAm: string;
  credentials: string;
  bioEn: string; bioAm: string;
  languages: string;
  photo: string;
  isPlaceholder: boolean;
};

export type PackageDTO = {
  id: string;
  nameEn: string; nameAm: string;
  descEn: string; descAm: string;
  items: Array<{ en: string; am: string }>;
  price: string;
  featured: boolean;
};

export type PostDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  readingTime: number;
  publishedAt: string; // ISO
};

export type TestimonialDTO = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  photo: string;
  isPlaceholder: boolean;
};

export type FaqDTO = {
  id: string;
  questionEn: string; questionAm: string;
  answerEn: string; answerAm: string;
  category: string;
};

export type GalleryDTO = {
  id: string;
  title: string;
  type: string;
  url: string;
  alt: string;
};

export type BranchDTO = {
  id: string;
  nameEn: string; nameAm: string;
  addressEn: string; addressAm: string;
  phone: string;
  hours: string; hoursAm: string;
  mapEmbedUrl: string;
  established: string;
  noteEn: string;
};

export type SectionRow = { key: string; data: { en: SectionData; am: SectionData }; visible: boolean; sortOrder: number };

export type SiteData = {
  settings: SiteSettings;
  content: Record<string, { en: SectionData; am: SectionData }>;
  sectionsIndex: Record<string, { visible: boolean; sortOrder: number }>;
  services: ServiceDTO[];
  doctors: DoctorDTO[];
  packages: PackageDTO[];
  posts: PostDTO[];
  testimonials: TestimonialDTO[];
  faqs: FaqDTO[];
  gallery: GalleryDTO[];
  branches: BranchDTO[];
};
