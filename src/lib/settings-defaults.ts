/** Global site settings — editable from Admin → Settings. */

export type SiteSettings = {
  clinicName: string;
  tagline: string;
  phone: string;
  phoneIntl: string; // tel: link format
  email: string;
  addressAddis: string;
  addressAmbo: string;
  hoursEn: string;
  hoursAm: string;
  socials: { facebook: string; tiktok: string; google: string; linkedin: string };
  heroVideo: string; // uploaded video URL ("" = cinematic fallback)
  heroPoster: string;
  logoUrl: string;
  preloaderEnabled: boolean;
  announcementEnabled: boolean;
  announcementEn: string;
  announcementAm: string;
  seoTitle: string;
  seoDescription: string;
  defaultLocale: "en" | "am";
  /** brand accent — editable by the super admin, validated for WCAG AA contrast */
  accentColor: string;
  /** informational only — Amharic copy is flagged for native-speaker review */
  amharicReviewFlag: boolean;
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  clinicName: "Universe Medical Center",
  tagline: "Better Care for Better Health",
  phone: "0116390354",
  phoneIntl: "+251116390354",
  email: "universeclinic2023@gmail.com",
  addressAddis:
    "Lemi Kura Subcity, Woreda 03, Zone 05, Straight 08, Ayat-Bole Arabsa Main Road, Addis Ababa, Ethiopia",
  addressAmbo: "Ambo City, West Shoa, Oromia Region (Heran Clinic — established February 2021)",
  hoursEn: "Monday – Saturday: 8:30 AM – 5:30 PM · Sunday: Emergency only",
  hoursAm: "ሰኞ – ቅዳሜ፡ 8:30 – 5:30 · እሁድ፡ አስቸኳይ ብቻ",
  socials: {
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    google: "https://google.com/maps",
    linkedin: "https://linkedin.com/",
  },
  heroVideo: "",
  heroPoster: "/img/hero-poster.jpg",
  logoUrl: "/logo.png",
  preloaderEnabled: true,
  announcementEnabled: false,
  announcementEn: "",
  announcementAm: "",
  seoTitle: "Universe Medical Center — Better Care for Better Health",
  seoDescription:
    "Compassionate, patient-first care backed by modern diagnostics. Internal medicine, labs, imaging and more in Addis Ababa and Ambo.",
  defaultLocale: "en",
  accentColor: "#E3202B",
  amharicReviewFlag: true,
};
