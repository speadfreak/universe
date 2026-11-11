/** UI-level translations (content copy lives in the database / content-schema). */

export type Locale = "en" | "am";
export const LOCALES: Locale[] = ["en", "am"];

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  am: "አማ",
};

type Dict = Record<string, { en: string; am: string }>;

const dict: Dict = {
  // nav
  "nav.home": { en: "Home", am: "መነሻ" },
  "nav.about": { en: "About", am: "ስለ እኛ" },
  "nav.services": { en: "Services", am: "አገልግሎቶች" },
  "nav.doctors": { en: "Doctors", am: "ሐኪሞች" },
  "nav.packages": { en: "Packages", am: "ጥቅሎች" },
  "nav.blog": { en: "Blog", am: "ብሎግ" },
  "nav.contact": { en: "Contact", am: "አግኙን" },
  "nav.resources": { en: "Patient Resources", am: "የታካሚ መረጃ" },
  "nav.book": { en: "Book Appointment", am: "ቀን ያስይዙ" },
  "nav.menu": { en: "Menu", am: "ዝርዝር" },
  "nav.close": { en: "Close", am: "ዝጋ" },

  // common
  "common.learnMore": { en: "Learn more", am: "የበለጠ ይወቁ" },
  "common.readMore": { en: "Read more", am: "ያንብቡ" },
  "common.viewAll": { en: "View all", am: "ሁሉንም ይመልከቱ" },
  "common.callNow": { en: "Call Us Now", am: "አሁን ይደውሉ" },
  "common.bookNow": { en: "Book Appointment", am: "ቀን ያስይዙ" },
  "common.ourServices": { en: "Our Services", am: "አገልግሎቶቻችን" },
  "common.directions": { en: "Directions", am: "አቅጣጫ" },
  "common.backHome": { en: "Back to Home", am: "ወደ መነሻ ይመለሱ" },
  "common.loading": { en: "Loading…", am: "በመጫን ላይ…" },
  "common.error": { en: "Something went wrong. Please try again.", am: "ችግር ደርሷል። እባክዎ እንደገና ይሞክሩ።" },
  "common.skipToContent": { en: "Skip to content", am: "ወደ ይዘቱ ዝለል" },
  "common.placeholder": { en: "Placeholder — replace from admin", am: "ናሙና — ከአስተዳደር ይተኩ" },

  // hero
  "hero.scroll": { en: "Scroll to explore", am: "ለማሰስ ይሸብልሉ" },

  // contact form
  "form.name": { en: "Full name", am: "ሙሉ ስም" },
  "form.phone": { en: "Phone number", am: "ስልክ ቁጥር" },
  "form.email": { en: "Email (optional)", am: "ኢሜይል (አማራጭ)" },
  "form.department": { en: "Department", am: "ክፍል" },
  "form.message": { en: "Your message", am: "መልእክትዎ" },
  "form.send": { en: "Send message", am: "መልእክት ይላኩ" },
  "form.sending": { en: "Sending…", am: "በመላክ ላይ…" },
  "form.sent": { en: "Message sent — we will get back to you shortly.", am: "መልእክትዎ ተልኳል — በቅርቡ እንመልስልዎታለን።" },
  "form.required": { en: "This field is required", am: "ይህ መስክ ያስፈልጋል" },

  // booking
  "book.title": { en: "Book an Appointment", am: "ቀን ያስይዙ" },
  "book.step": { en: "Step", am: "ደረጃ" },
  "book.service": { en: "Service", am: "አገልግሎት" },
  "book.doctor": { en: "Doctor (optional)", am: "ሐኪም (አማራጭ)" },
  "book.datetime": { en: "Date & time", am: "ቀን እና ሰዓት" },
  "book.details": { en: "Your details", am: "የእርስዎ መረጃ" },
  "book.confirm": { en: "Confirmation", am: "ማረጋገጫ" },
  "book.next": { en: "Continue", am: "ቀጥል" },
  "book.back": { en: "Back", am: "ተመለስ" },
  "book.submit": { en: "Confirm appointment", am: "ቀን አረጋግጥ" },
  "book.anyDoctor": { en: "No preference", am: "ልዩ ምርጫ የለም" },
  "book.morning": { en: "Morning", am: "ጠዋት" },
  "book.afternoon": { en: "Afternoon", am: "ከሰዓት" },
  "book.success": { en: "Appointment request received!", am: "የቀን ጥያቄዎ ደርሷል!" },
  "book.reference": { en: "Reference code", am: "ማጣቀሻ ቁጥር" },

  // newsletter / footer
  "news.title": { en: "Health tips in your inbox", am: "የጤና ምክሮች በኢሜይልዎ" },
  "news.placeholder": { en: "Your email address", am: "የእርስዎ ኢሜይል" },
  "news.subscribe": { en: "Subscribe", am: "ይመዝገቡ" },
  "news.thanks": { en: "Subscribed — welcome to the family!", am: "ተመዝግበዋል — እንኳን ደህና መጡ!" },

  // misc
  "faq.title": { en: "Frequently asked questions", am: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች" },
  "emergency.tag": { en: "Emergency? Call us now", am: "አስቸኳይ? አሁን ይደውሉ" },
  "top": { en: "Back to top", am: "ወደላይ" },
};

export function t(key: string, locale: Locale): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[locale] || entry.en;
}

export function pick<T>(locale: Locale, en: T, am: T): T {
  return locale === "am" && (am !== undefined && am !== null && am !== "") ? am : en;
}
