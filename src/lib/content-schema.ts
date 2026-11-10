/**
 * Content schema — single source of truth for every editable section
 * on the public site. Each section has typed fields; the admin panel
 * renders visual forms from these definitions, and the front end reads
 * merged data (DB overrides → these defaults) through getContent().
 */

export type FieldType = "text" | "textarea" | "image" | "video" | "url";
export type FieldDef = { name: string; label: string; type: FieldType; list?: FieldDef[] };
export type SectionDef = { key: string; label: string; fields: FieldDef[] };
export type PageDef = { page: string; label: string; sections: SectionDef[] };

export type SectionValue = string | Array<Record<string, string>>;
export type SectionData = Record<string, SectionValue>;
export type LocaleData = { en: SectionData; am: SectionData };

const F = (name: string, label: string, type: FieldType = "text", list?: FieldDef[]): FieldDef =>
  list ? { name, label, type, list } : { name, label, type };
const L = (name: string, label: string, list: FieldDef[]): FieldDef => ({ name, label, type: "text", list });

export const CONTENT_SCHEMA: PageDef[] = [
  {
    page: "home",
    label: "Home",
    sections: [
      {
        key: "hero",
        label: "Hero",
        fields: [
          F("badge"), F("title"), F("titleAccent"), F("subtitle", "Subtitle", "textarea"),
          F("ctaPrimary"), F("ctaSecondary"), F("scrollHint"),
          L("stats", "Stat chips", [F("value"), F("label")]),
        ],
      },
      { key: "trust", label: "Trust marquee", fields: [L("chips", "Chips", [F("text")])] },
      {
        key: "pillars", label: "Three pillars",
        fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea"),
          L("items", "Pillars", [F("icon"), F("title"), F("text", "Text", "textarea")])],
      },
      {
        key: "about", label: "About teaser",
        fields: [F("eyebrow"), F("title"), F("text", "Text", "textarea"), F("image", "Image", "image"),
          F("ctaLabel"), L("chips", "Highlight chips", [F("text")]),
          L("stats", "Animated stats", [F("value"), F("label")])],
      },
      {
        key: "journey", label: "Patient journey (pinned story)",
        fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea"),
          L("steps", "Steps", [F("title"), F("text", "Text", "textarea")])],
      },
      { key: "services", label: "Services grid", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      {
        key: "why", label: "Why choose us",
        fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea"),
          L("items", "Reasons", [F("icon"), F("title"), F("text", "Text", "textarea")])],
      },
      { key: "doctors", label: "Doctors preview", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "packages", label: "Packages teaser", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "testimonials", label: "Testimonials", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      {
        key: "ctaHelp", label: "Call for help banner",
        fields: [F("title"), F("buttonLabel"), F("phone"),
          L("bullets", "Bullets", [F("text")])],
      },
      { key: "blog", label: "Blog teaser", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "faq", label: "FAQ teaser", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "final", label: "Final CTA", fields: [F("title"), F("text", "Text", "textarea"), F("ctaPrimary"), F("ctaSecondary")] },
    ],
  },
  {
    page: "about",
    label: "About",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      {
        key: "story", label: "Story",
        fields: [F("eyebrow"), F("title"), F("text", "Text", "textarea"), F("text2", "Text 2", "textarea"), F("image", "Image", "image")],
      },
      {
        key: "timeline", label: "History timeline",
        fields: [F("eyebrow"), F("title"), L("items", "Milestones", [F("year"), F("title"), F("text", "Text", "textarea")])],
      },
      { key: "mission", label: "Mission", fields: [F("eyebrow"), F("title"), F("text", "Text", "textarea")] },
      {
        key: "values", label: "Values",
        fields: [F("eyebrow"), F("title"), L("items", "Values", [F("title"), F("text", "Text", "textarea")])],
      },
      { key: "branches", label: "Branches", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "team", label: "Team preview", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "gallery", label: "Facilities gallery", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
    ],
  },
  {
    page: "services",
    label: "Services",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "intro", label: "Intro", fields: [F("title"), F("text", "Text", "textarea")] },
    ],
  },
  {
    page: "doctors",
    label: "Doctors",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "note", label: "Placeholder notice", fields: [F("title"), F("text", "Text", "textarea")] },
    ],
  },
  {
    page: "packages",
    label: "Health Packages",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "corporate", label: "Corporate partnerships", fields: [F("title"), F("text", "Text", "textarea"), F("ctaLabel")] },
    ],
  },
  { page: "blog", label: "Blog", sections: [{ key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] }] },
  {
    page: "contact",
    label: "Contact",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "intro", label: "Get in touch", fields: [F("eyebrow"), F("title"), F("text", "Text", "textarea")] },
      { key: "hours", label: "Working hours", fields: [F("title"), F("text", "Text", "textarea")] },
    ],
  },
  {
    page: "book",
    label: "Book Appointment",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "success", label: "Success screen", fields: [F("title"), F("text", "Text", "textarea")] },
    ],
  },
  {
    page: "resources",
    label: "Patient Resources",
    sections: [
      { key: "hero", label: "Hero", fields: [F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "bring", label: "What to bring", fields: [F("eyebrow"), F("title"), L("items", "Items", [F("text")])] },
      { key: "insurance", label: "Insurance & payment", fields: [F("eyebrow"), F("title"), F("text", "Text", "textarea")] },
      { key: "lab", label: "Preparing for lab tests", fields: [F("eyebrow"), F("title"), L("items", "Tips", [F("text")])] },
      { key: "rights", label: "Patient rights & privacy", fields: [F("eyebrow"), F("title"), L("items", "Rights", [F("text")])] },
      { key: "forms", label: "Downloadable forms", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
      { key: "gallery", label: "Gallery", fields: [F("eyebrow"), F("title"), F("subtitle", "Subtitle", "textarea")] },
    ],
  },
  {
    page: "footer",
    label: "Footer & global",
    sections: [
      { key: "main", label: "Footer", fields: [F("tagline", "Tagline", "textarea"), F("quickTitle"), F("servicesTitle"), F("contactTitle"), F("newsletterTitle"), F("newsletterText", "Newsletter text", "textarea"), F("copyright"), F("creditLabel"), F("creditUrl", "Credit URL", "url")] },
      { key: "disclaimer", label: "Medical disclaimer", fields: [F("text", "Text", "textarea")] },
    ],
  },
  {
    page: "error",
    label: "Error pages",
    sections: [
      { key: "notfound", label: "404", fields: [F("title"), F("text", "Text", "textarea"), F("cta")] },
      { key: "serverError", label: "500", fields: [F("title"), F("text", "Text", "textarea"), F("cta")] },
    ],
  },
];

// ───────────────────────── Defaults ─────────────────────────

const s = (page: string, key: string) => `${page}.${key}`;

export const CONTENT_DEFAULTS: Record<string, LocaleData> = {
  // ── HOME ────────────────────────────────────────────────────
  [s("home", "hero")]: {
    en: {
      badge: "Addis Ababa & Ambo · Ethiopia",
      title: "Better Care for",
      titleAccent: "Better Health",
      subtitle:
        "At Universe Medical Center, we combine compassionate care with modern medical technology to provide preventive, diagnostic, and specialized internal medicine services you can trust.",
      ctaPrimary: "Book Appointment",
      ctaSecondary: "Our Services",
      scrollHint: "Scroll to explore",
      stats: [
        { value: "5+", label: "Years of Experience" },
        { value: "7k", label: "Satisfied Patients" },
        { value: "2", label: "Branches — Addis Ababa & Ambo" },
      ],
    },
    am: {
      badge: "አዲስ አበባ እና አምቦ · ኢትዮጵያ",
      title: "የተሻለ እንክብካቤ፣",
      titleAccent: "የተሻለ ጤና",
      subtitle:
        "በዩኒቨርስ ሜዲካል ሴንተር ርኅራኄ የተሞላ እንክብካቤን ከዘመናዊ የሕክምና ቴክኖሎጂ ጋር በማዋሃድ መከላከያ፣ የምርመራ እና የተለዩ የውስጥ ሕክምና አገልግሎቶችን እንሰጣለን።",
      ctaPrimary: "ቀን ያስይዙ",
      ctaSecondary: "አገልግሎቶቻችን",
      scrollHint: "ለማሰስ ይሸብልሉ",
      stats: [
        { value: "5+", label: "የሥራ ዓመታት" },
        { value: "7k", label: "የተሟላ ታካሚዎች" },
        { value: "2", label: "ቅርንጫፎች — አዲስ አበባ እና አምቦ" },
      ],
    },
  },
  [s("home", "trust")]: {
    en: { chips: [{ text: "Expert internal medicine" }, { text: "Modern laboratory" }, { text: "Digital X-ray & ultrasound" }, { text: "Compassionate service" }, { text: "Affordable care" }, { text: "Patient-first always" }] },
    am: { chips: [{ text: "የውስጥ ሕክምና ባለሙያዎች" }, { text: "ዘመናዊ ላብራቶሪ" }, { text: "ዲጂታል ኤክስሬይ እና ኣስርጣጥ" }, { text: "ርኅራኄ የተሞላ አገልግሎት" }, { text: "ቀላል እና ተመጣጣኝ" }, { text: "ታካሚ በፊት ሁልጊዜ" }] },
  },
  [s("home", "pillars")]: {
    en: {
      eyebrow: "Why Universe",
      title: "Care built around you",
      subtitle: "Three commitments shape every visit — from your first call to your follow-up.",
      items: [
        { icon: "stethoscope", title: "Expert Care", text: "Specialists in internal medicine." },
        { icon: "microscope", title: "Modern Diagnostics", text: "Advanced lab & imaging services." },
        { icon: "heart-handshake", title: "Compassionate Service", text: "Affordable, patient-first care." },
      ],
    },
    am: {
      eyebrow: "ለምን ዩኒቨርስ",
      title: "በእርስዎ ዙሪያ የተሰራ እንክብካቤ",
      subtitle: "ከመጀመሪያዎቹ ጥሪዎች እስከ ተከታታይ ቁጥጥሮችዎ ድረስ ሦስት ቃል ኪዳኖች እያንዳንዱን ጉብኝት ይቀርጻሉ።",
      items: [
        { icon: "stethoscope", title: "ባለሙያ እንክብካቤ", text: "በውስጥ ሕክምና ባለሙያዎች።" },
        { icon: "microscope", title: "ዘመናዊ ምርመራ", text: "የላቀ የላብራቶሪ እና የምስል አገልግሎት።" },
        { icon: "heart-handshake", title: "ርኅራኄ የተሞላ አገልግሎት", text: "ቀላል፣ ታካሚ በፊት ያለ እንክብካቤ።" },
      ],
    },
  },
  [s("home", "about")]: {
    en: {
      eyebrow: "Your trusted partner",
      title: "Compassionate, patient-first care backed by modern diagnostics",
      text:
        "As the second branch of Heran Clinic, Universe Medical Center provides preventive, diagnostic, and curative internal medicine services in Addis Ababa and Ambo. Our experienced team focuses on timely, affordable care that improves health outcomes for individuals and families.",
      image: "/img/about-teaser.jpg",
      ctaLabel: "More about us",
      chips: [
        { text: "አዲስ አበባ እና አምቦ" },
        { text: "ቀላል እና ተመጣጣኝ" },
        { text: "የውስጥ ሕክምና" },
        { text: "ዘመናዊ ኣስርጣጥ" },
      ],
      stats: [
        { value: "5", label: "Years of experience" },
        { value: "7000", label: "Satisfied patients" },
        { value: "2", label: "Branches" },
        { value: "6", label: "Core services" },
      ],
    },
    am: {
      eyebrow: "የሚታመን አጋርዎ",
      title: "በዘመናዊ ምርመራ የተደገፈ ርኅራኄ የተሞላ እንክብካቤ",
      text:
        "የሄራን ክሊኒክ ሁለተኛ ቅርንጫፍ ሆነን፣ በአዲስ አበባ እና በአምቦ መከላከያ፣ የምርመራ እና የሕክምና አገልግሎቶችን እናቀርባለን። የተለዩን ሰዎችንና ቤተሰቦችን የጤና ውጤት የሚያሻሽል በጊዜውና ተመጣጣኝ እንክብካቤ ላይ ያተኮረ ቡድን አለን።",
      image: "/img/about-teaser.jpg",
      ctaLabel: "ተጨማሪ ይወቁ",
      chips: [
        { text: "አዲስ አበባ እና አምቦ" },
        { text: "ቀላል እና ተመጣጣኝ" },
        { text: "የውስጥ ሕክምና" },
        { text: "ዘመናዊ ኣስርጣጥ" },
      ],
      stats: [
        { value: "5", label: "የሥራ ዓመታት" },
        { value: "7000", label: "የተሟላ ታካሚዎች" },
        { value: "2", label: "ቅርንጫፎች" },
        { value: "6", label: "ዋና አገልግሎቶች" },
      ],
    },
  },
  [s("home", "journey")]: {
    en: {
      eyebrow: "Your patient journey",
      title: "From first call to full recovery",
      subtitle: "Five simple steps — designed to remove delays between you and the right care.",
      steps: [
        { title: "Book", text: "Reach us online or by phone and pick a time that suits you." },
        { title: "Consult", text: "Sit down with an internal-medicine specialist who listens first." },
        { title: "Diagnose", text: "On-site lab and imaging deliver accurate answers, fast." },
        { title: "Treat", text: "A clear, personalised treatment plan — explained in your language." },
        { title: "Follow-up", text: "We track your progress and adjust care until you are well." },
      ],
    },
    am: {
      eyebrow: "የታካሚ ጉዞዎ",
      title: "ከመጀመሪያው ጥሪ እስከ ሙሉ ድኅነት",
      subtitle: "አምስት ቀላል ደረጃዎች — እርስዎንና ትክክለኛ እንክብካቤን የሚለይበትን መዘግየት ለማስወገድ የተነደፉ።",
      steps: [
        { title: "ቀን ይያዙ", text: "በመስመር ላይ ወይም በስልክ ይደውሉና ለእርስዎ ተስማሚ ሰዓት ይምረጡ።" },
        { title: "ይነጋገሩ", text: "መጀመሪያ የሚያዳምጥ የውስጥ ሕክምና ባለሙያ ጋር ይቀመጡ።" },
        { title: "ይመረመሩ", text: "በሥፍራው ያለ ላብራቶሪ እና ምስል በፍጥነት ትክክለኛ መልስ ይሰጣል።" },
        { title: "ይታከሙ", text: "በቋንቋዎ የተገለጸ ግልጽ፣ ለእርስዎ የተሰራ የሕክምና እቅድ።" },
        { title: "ተከታተሉ", text: "እስኪደህኑ ድረስ የእርስዎን ዕድገት እንከታተላለን።" },
      ],
    },
  },
  [s("home", "services")]: {
    en: { eyebrow: "What we offer", title: "Six services, one seamless experience", subtitle: "From everyday checkups to advanced diagnostics — everything under one roof." },
    am: { eyebrow: "የምናቀርባቸው", title: "ስድስት አገልግሎቶች፣ አንድ አስተማማኝ ልምድ", subtitle: "ከዕለት ተዕለት ምርመራዎች እስከ ዘመናዊ ምርመራ — ሁሉም በአንድ ጣቢያ።" },
  },
  [s("home", "why")]: {
    en: {
      eyebrow: "Why choose us",
      title: "The Universe difference",
      subtitle: "Founded to reduce unnecessary delays in diagnosis and treatment — and to raise patient satisfaction.",
      items: [
        { icon: "clock", title: "Timely care", text: "Our goal is to cut the waiting between symptoms, diagnosis and treatment." },
        { icon: "scan-heart", title: "Modern technology", text: "Modern diagnostic labs, imaging technologies and digital health tools." },
        { icon: "user-round-check", title: "Experienced specialists", text: "Experienced specialist and sub-specialist physicians in internal medicine." },
        { icon: "hand-coins", title: "Accessible & affordable", text: "Comprehensive care that is accessible and affordable for every family." },
      ],
    },
    am: {
      eyebrow: "ለምን እኛን ይምረጡ",
      title: "የዩኒቨርስ ልዩነት",
      subtitle: "በምርመራና ሕክምና ላይ ያለውን ያላስፈላጊ መዘግየት ለመቀነስና የታካሚ እርካታን ለማሳደግ የተመሰረተ።",
      items: [
        { icon: "clock", title: "በጊዜው እንክብካቤ", text: "በምልክቶች፣ በምርመራና በሕክምና መካከል ያለውን ጠብታ ለመቀነስ ጉዞዋችን ነው።" },
        { icon: "scan-heart", title: "ዘመናዊ ቴክኖሎጂ", text: "ዘመናዊ የምርመራ ላብራቶሪዎች፣ የምስል ቴክኖሎጂዎች እና ዲጂታል የጤና መሣሪያዎች።" },
        { icon: "user-round-check", title: "ተሞክሮ ያላቸው ባለሙያዎች", text: "በውስጥ ሕክምና ተሞክሮ ያላቸው ስፔሻሊስት እና ስድስት-ስፔሻሊስት ሐኪሞች።" },
        { icon: "hand-coins", title: "ተደራሽ እና ተመጣጣኝ", text: "ለእያንዳንዱ ቤተሰብ ተደራሽና ተመጣጣኝ የሆነ አጠቃላይ እንክብካቤ።" },
      ],
    },
  },
  [s("home", "doctors")]: {
    en: { eyebrow: "Our team", title: "Meet the specialists", subtitle: "Experienced physicians who put you first. Profiles are being finalized." },
    am: { eyebrow: "ቡድናችን", title: "ባለሙያዎቻችንን ያውቁ", subtitle: "እርስዎን በፊት የሚያደርጉ ተሞክሮ ያላቸው ሐኪሞች።" },
  },
  [s("home", "packages")]: {
    en: { eyebrow: "Health packages", title: "Checkups made simple", subtitle: "Choose a curated package and let our team handle the rest." },
    am: { eyebrow: "የጤና ጥቅሎች", title: "ቀላል የሆነ ምርመራ", subtitle: "የተመረጠ ጥቅል ይምረጡ፤ ቀሪውን ቡድናችን ይያዛል።" },
  },
  [s("home", "testimonials")]: {
    en: { eyebrow: "Patient voices", title: "Stories that keep us going", subtitle: "Sample quotes shown as placeholders — real patient stories are added with consent." },
    am: { eyebrow: "የታካሚዎች ድምጽ", title: "የሚያበረታቱን ታሪኮች", subtitle: "ናሙና ጥቅሶች ናቸው — በፈቃድ የታካሚዎች ታሪኮች ይጨመራሉ።" },
  },
  [s("home", "ctaHelp")]: {
    en: {
      title: "Take the First Step Toward Better Health",
      buttonLabel: "Call Us Now",
      phone: "0116390354",
      bullets: [
        { text: "Online & phone appointments" },
        { text: "Labs & imaging with latest tech" },
        { text: "Expert internal medicine team" },
        { text: "Always available for patients" },
      ],
    },
    am: {
      title: "ወደ ተሻለ ጤና የመጀመሪያውን እርምጃ ይውሰዱ",
      buttonLabel: "አሁን ይደውሉ",
      phone: "0116390354",
      bullets: [
        { text: "በመስመር ላይ እና በስልክ የቀን ማስያዝ" },
        { text: "በአዲስ ቴክኖሎጂ ላብ እና ምስል" },
        { text: "የውስጥ ሕክምና ባለሙያ ቡድን" },
        { text: "ለታካሚዎች ሁልጊዜ ዝግጁ" },
      ],
    },
  },
  [s("home", "blog")]: {
    en: { eyebrow: "Health journal", title: "Latest from the blog", subtitle: "Practical guidance from our team — written for everyday life." },
    am: { eyebrow: "የጤና መጽሔት", title: "ከብሎጋችን የቅርብ ጊዜ", subtitle: "ለዕለት ተዕለት ሕይወት ከቡድናችን ተግባራዊ መመሪያዎች።" },
  },
  [s("home", "faq")]: {
    en: { eyebrow: "Good to know", title: "Frequently asked questions", subtitle: "Quick answers before your visit." },
    am: { eyebrow: "ለማወቅ ጠቃሚ", title: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች", subtitle: "ከጉብኝትዎ በፊት ፈጣን መልሶች።" },
  },
  [s("home", "final")]: {
    en: {
      title: "Your health can't wait. Neither should you.",
      text: "Book a consultation with our internal-medicine team today — in Addis Ababa or Ambo.",
      ctaPrimary: "Book Appointment",
      ctaSecondary: "Call 0116390354",
    },
    am: {
      title: "ጤናዎ ማስተላለፍ አይችልም። እርስዎም አይኖርብዎም።",
      text: "ዛሬ ከውስጥ ሕክምና ቡድናችን ጋር ይነጋገሩ — በአዲስ አበባ ወይም በአምቦ።",
      ctaPrimary: "ቀን ያስይዙ",
      ctaSecondary: "0116390354 ይደውሉ",
    },
  },

  // ── ABOUT ───────────────────────────────────────────────────
  [s("about", "hero")]: {
    en: { title: "The Best Health Service That You Can Trust", subtitle: "Bridging the gap between patients and providers — with compassion, expertise, and advanced technology." },
    am: { title: "በማትታመነው ምርጥ የጤና አገልግሎት", subtitle: "በታካሚዎችና በአገልግሎት መስጫዎች መካከል ያለውን ክፍተት ማሟያ — በርኅራኄ፣ በክህሎት እና በዘመናዊ ቴክኖሎጂ።" },
  },
  [s("about", "story")]: {
    en: {
      eyebrow: "Our story",
      title: "Passionate about bridging the gap",
      text:
        "We are passionate about bridging the gap between patients and providers, empowering our community with a complete toolkit of medical solutions delivered with compassion, expertise, and advanced technology.",
      text2:
        "Universe Medical Center is the second branch of Heran Clinic, which was established in February 2021 in Ambo City, Oromia. Due to the high demand for quality healthcare, Universe Clinic opened its doors in August 2022 in Addis Ababa, Lemi Kura Subcity, Zone 05. Both clinics were founded to provide comprehensive, accessible, and affordable healthcare using modern diagnostic labs, imaging technologies, and experienced specialist physicians. Our goal is to reduce unnecessary delays in diagnosis and treatment, lower mortality and morbidity, and enhance patient satisfaction.",
      image: "/img/about-story.jpg",
    },
    am: {
      eyebrow: "ታሪካችን",
      title: "ክፍተቱን ለመሙላት የተነሳን",
      text:
        "በታካሚዎችና በአገልግሎት መስጫዎች መካከል ያለውን ክፍተት ለመሙላት በርኅራኄ፣ በክህሎት እና በዘመናዊ ቴክኖሎጂ የተሟላ የሕክምና መፍትሔዎችን በማቅረብ ማህበረሰባችንን ለማስታጠቅ ቆርበን ተነስተናል።",
      text2:
        "ዩኒቨርስ ሜዲካል ሴንተር በየካቲት 2021 በአምቦ ከተማ ከተመሰረተው የሄራን ክሊኒክ ሁለተኛ ቅርንጫፍ ነው። ለጥራት የተሞላ የጤና አገልግሎት ከፍተኛ ፍላጎት ምክንያት፣ ዩኒቨርስ ክሊኒክ በነሐሴ 2014 በአዲስ አበባ ለሚ ቁራ ክፍለ ከተማ ዞን 05 በሮቹን ከፈተ። ሁለቱም ክሊኒኮች ዘመናዊ የምርመራ ላብራቶሪዎችን፣ የምስል ቴክኖሎጂዎችን እና ተሞክሮ ያላቸውን ስፔሻሊስት ሐኪሞች በመጠቀም አጠቃላይ፣ ተደራሽ እና ተመጣጣኝ የጤና እንክብካቤ ለመስጠት ተመስርተዋል።",
      image: "/img/about-story.jpg",
    },
  },
  [s("about", "timeline")]: {
    en: {
      eyebrow: "Milestones",
      title: "Two clinics, one mission",
      items: [
        { year: "Feb 2021", title: "Heran Clinic — Ambo", text: "Heran Clinic opens in Ambo City, West Shoa, Oromia, bringing specialist care closer to the community." },
        { year: "Aug 2022", title: "Universe Clinic — Addis Ababa", text: "Responding to high demand for quality healthcare, Universe Clinic opens in Lemi Kura Subcity, Zone 05." },
        { year: "Today", title: "Growing with our patients", text: "Thousands of patients later, our teams continue to deliver timely, affordable, patient-first care." },
        { year: "Next", title: "A fully digital clinic", text: "Digital scheduling, records and health packages — connected care for every family we serve." },
      ],
    },
    am: {
      eyebrow: "ምዕራፎች",
      title: "ሁለት ክሊኒኮች፣ አንድ ተልእኮ",
      items: [
        { year: "የካቲት 2021", title: "ሄራን ክሊኒክ — አምቦ", text: "ሄራን ክሊኒክ በአምቦ ከተማ፣ ምዕራብ ሸዋ ፣ ኦሮሚያ በመክፈት ስፔሻሊስት እንክብካቤን ከማህበረሰቡ ጋር አቀረበ።" },
        { year: "ነሐሴ 2014", title: "ዩኒቨርስ ክሊኒክ — አዲስ አበባ", text: "ለጥራት የተሞላ የጤና አገልግሎት ከፍተኛ ፍላጎት ምክንያት በለሚ ቁራ ክፍለ ከተማ ዞን 05 ተከፈተ።" },
        { year: "ዛሬ", title: "ከታካሚዎቻችን ጋር እያደገ", text: "በሺዎች የሚቆጠሩ ታካሚዎች በኋላ፣ ቡድኖቻችን በጊዜው፣ ተመጣጣኝ እና ታካሚ በፊት ያለ እንክብካቤ መስጠትን ቀጥለዋል።" },
        { year: "ቀጣይ", title: "ሙሉ ስልት ዲጂታል ክሊኒክ", text: "ዲጂታል የቀን ማስያዝ፣ መዝገቦች እና የጤና ጥቅሎች — ለምናገለግላቸው ቤተሰቦች የተገናኘ እንክብካቤ።" },
      ],
    },
  },
  [s("about", "mission")]: {
    en: {
      eyebrow: "We care about you",
      title: "Our mission",
      text:
        "To mobilize financial, human, and material resources efficiently to provide cost-effective, high-quality healthcare. We leverage modern biomedical technologies and a team of compassionate, ethically skilled health professionals to meet the healthcare demands of our community.",
    },
    am: {
      eyebrow: "እንከታከምልዎታለን",
      title: "ተልእኳችን",
      text:
        "ወጪ-ቆጣቢና ከፍተኛ ጥራት ያለው የጤና አገልግሎት ለማቅረብ የፋይናንስ፣ የሰው ኃይልና የቁሳቁስ መልሶችን በብቃት ማመዛዘን። ዘመናዊ የባዮሜዲካል ቴክኖሎጂዎችን እና ርኅራኄ የተሞላባቸውን፣ በስነምግባር የተሰለፉ የጤና ባለሙያዎችን በመጠቀም የማህበረሰባችንን የጤና ፍላጎት ማሟላት።",
    },
  },
  [s("about", "values")]: {
    en: {
      eyebrow: "Our values",
      title: "What we stand for",
      items: [
        { title: "Compassionate Care", text: "We protect our patients' wellbeing with dedication at all times." },
        { title: "Respect & Motivation", text: "We value and motivate every professional and support team member." },
        { title: "Loyalty to Customers", text: "We build strong, honest relationships with every client we serve." },
        { title: "Service & Product Quality", text: "We uphold the highest standards of service and quality at every level." },
      ],
    },
    am: {
      eyebrow: "እሴቶቻችን",
      title: "የምንቆምባቸው",
      items: [
        { title: "ርኅራኄ የተሞላ እንክብካቤ", text: "ከሁሉም ጊዜ በታማኝነት የታካሚዎችን ደህንነት እንሰጣለን" },
        { title: "ክብር እና ተነሳሽነት", text: "ሁሉንም ባለሙያና ያልተሟላ ሠራተኞች እንክብካቤ እና እንመክትባለን" },
        { title: "ለደንበኞች ታማኝነት", text: "ጠንካራ እና ትክክለኛ ግንኙነት ከደንበኞቻችን ጋር እንጠብቃለን" },
        { title: "የአገልግሎት ጥራት", text: "በሁሉም ደረጃ ከፍተኛ የአገልግሎትና የምርት ጥራት እንጠብቃለን" },
      ],
    },
  },
  [s("about", "branches")]: {
    en: { eyebrow: "Find us", title: "Two homes for your health", subtitle: "From Ayat-Bole Arabsa main road to the heart of Ambo — expert care is never far." },
    am: { eyebrow: "ያግኙን", title: "ለጤናዎ ሁለት ቤቶች", subtitle: "ከአያት-ቦሌ ዋና መንገድ እስከ የአምቦ ልብ — ባለሙያ እንክብካቤ በጣም አይርቅም።" },
  },
  [s("about", "team")]: {
    en: { eyebrow: "Our people", title: "A team that treats you like family", subtitle: "Specialists, nurses and support staff — chosen for skill and kindness." },
    am: { eyebrow: "ሰዎቻችን", title: "እንደ ቤተሰብ የሚያከባቡ ቡድን", subtitle: "ስፔሻሊስቶች፣ ነርሶች እና ድጋፍ ሰጪ ሠራተኞች — በክህሎትና በርኅራኄ የተመረጡ።" },
  },
  [s("about", "gallery")]: {
    en: { eyebrow: "Facilities", title: "Designed for calm, equipped for care", subtitle: "A look inside our clinics." },
    am: { eyebrow: "መሰረተ ልማት", title: "ለረጋሳት የተነደፈ፣ ለእንክብካቤ የታጠቀ", subtitle: "ክሊኒኮቻችን ውስጥ እይታ።" },
  },

  // ── SERVICES ────────────────────────────────────────────────
  [s("services", "hero")]: {
    en: { title: "Comprehensive care, under one roof", subtitle: "Internal medicine, diagnostics, imaging and digital health — built around your needs." },
    am: { title: "አጠቃላይ እንክብካቤ፣ በአንድ ጣቢያ", subtitle: "የውስጥ ሕክምና፣ ምርመራ፣ ምስል እና ዲጂታል ጤና — በፍላጎትዎ ዙሪያ።" },
  },
  [s("services", "intro")]: {
    en: { title: "Every service, one standard: yours", text: "Browse our services to see what to expect, how the process works, and how to prepare — then book in minutes." },
    am: { title: "እያንዳንዱ አገልግሎት፣ አንድ መስፈርት፡ የእርስዎ", text: "አገልግሎቶቻችንን ይመልከቱ፤ ምን እንደሚጠብቁዎት፣ ሂደቱ እንዴት እንደሚሰራ እና እንዴት እንደሚዘጋጁ ይወቁ — ከዚያ በደቂቃዎች ውስጥ ይያዙ።" },
  },

  // ── DOCTORS ─────────────────────────────────────────────────
  [s("doctors", "hero")]: {
    en: { title: "Meet our doctors", subtitle: "Experienced specialists and sub-specialists in internal medicine and its fields." },
    am: { title: "ሐኪሞቻችንን ያውቁ", subtitle: "በውስጥ ሕክምና እና ቅርንጫፎቹ ውስጥ ተሞክሮ ያላቸው ስፔሻሊስቶች።" },
  },
  [s("doctors", "note")]: {
    en: { title: "Profiles are being finalized", text: "The profiles below are labelled placeholders. Our communications team is collecting verified credentials, photos and consents — this page will be updated as they are confirmed." },
    am: { title: "መገለጫዎች በመጨረሻ ላይ", text: "ከታች ያሉ መገለጫዎች ናሙና መሆናቸው ተመልክቷል። የተረጋገጡ መረጃዎች ሲያረጋገጡ ይዘምናል።" },
  },

  // ── PACKAGES ────────────────────────────────────────────────
  [s("packages", "hero")]: {
    en: { title: "Health packages for every stage of life", subtitle: "Curated checkup bundles — transparent, convenient, and guided by clinicians." },
    am: { title: "ለእያንዳንዱ የሕይወት ደረጃ የጤና ጥቅሎች", subtitle: "የተመረጡ የምርመራ ጥቅሎች — ግልጽ፣ ምቹ እና በባለሙያዎች የተመሩ።" },
  },
  [s("packages", "corporate")]: {
    en: { title: "Corporate health partnerships", text: "Keep your team healthy with tailored corporate checkup programs, on-site screening days and priority scheduling for your staff.", ctaLabel: "Request a partnership proposal" },
    am: { title: "የድርጅት ጤና አጋርነት", text: "ለሠራተኞችዎ የተስተካከሉ የድርጅት ምርመራ ፕሮግራሞች፣ በሥፍራው ላይ ማያዣዎች እና ቅድሚያ የቀን ማስያዝ።", ctaLabel: "የአጋርነት ፕሮፖዛል ይጠይቁ" },
  },

  // ── BLOG ────────────────────────────────────────────────────
  [s("blog", "hero")]: {
    en: { title: "The health journal", subtitle: "Practical, cautious, and clear — health guidance written for everyday life in Ethiopia." },
    am: { title: "የጤና መጽሔት", subtitle: "ተግባራዊ፣ ጥንቃቄ የተሞላበት እና ግልጽ — ለዕለት ተዕለት ሕይወት የተጻፉ የጤና መመሪያዎች።" },
  },

  // ── CONTACT ─────────────────────────────────────────────────
  [s("contact", "hero")]: {
    en: { title: "We're here for you", subtitle: "Questions, appointments, support — reach out anytime." },
    am: { title: "ለእርስዎ እዚህ ነን", subtitle: "ጥያቄዎች፣ የቀን ማስያዝ፣ ድጋፍ — በማንኛውም ጊዜ ያግኙን።" },
  },
  [s("contact", "intro")]: {
    en: { eyebrow: "Get in touch", title: "Let's start a conversation", text: "At Universe Medical Center, we are here to answer your questions, schedule appointments, and provide timely support. Reach out to us anytime — our friendly staff is ready to assist you." },
    am: { eyebrow: "ያግኙን", title: "ውይይት ይጀምሩ", text: "በዩኒቨርስ ሜዲካል ሴንተር፣ ጥያቄዎችዎን ለመመለስ፣ የቀን ለማስያዝ እና በጊዜው ድጋፍ ለመስጠት ዝግጁ ነን። በማንኛውም ጊዜ ያግኙን — ወዳጃዊ ሠራተኞቻችን ለመርዳት ተዘጋጅተዋል።" },
  },
  [s("contact", "hours")]: {
    en: { title: "Working hours", text: "Monday – Saturday: 8:30 AM – 5:30 PM · Sunday: Emergency only. Hours may vary — call us to confirm before visiting." },
    am: { title: "የሥራ ሰዓታት", text: "ሰኞ – ቅዳሜ፡ 8:30 – 5:30 · እሁድ፡ አስቸኳይ ብቻ። ሰዓታቱ ሊለዩ ይችላሉ — ከመምጣትዎ በፊት ይደውሉልን።" },
  },

  // ── BOOK ────────────────────────────────────────────────────
  [s("book", "hero")]: {
    en: { title: "Book an appointment", subtitle: "Five quick steps — service, doctor, time, details, done." },
    am: { title: "ቀን ያስይዙ", subtitle: "አምስት ፈጣን ደረጃዎች — አገልግሎት፣ ሐኪም፣ ሰዓት፣ መረጃ፣ ተጠናቋል።" },
  },
  [s("book", "success")]: {
    en: { title: "Request received!", text: "Your appointment request has been saved. Our reception team will confirm your slot by phone. Keep your reference code handy — quote it when you call 0116390354." },
    am: { title: "ጥያቄዎ ደርሷል!", text: "የቀን ጥያቄዎ ተቀምጧል። የመቀበያ ቡድናችን በስልክ ያረጋግጥልዎታል። የማጣቀሻ ቁጥርዎን ያስቀምጡ።" },
  },

  // ── RESOURCES ───────────────────────────────────────────────
  [s("resources", "hero")]: {
    en: { title: "Patient resources", subtitle: "Everything you need to prepare for your visit — in one place." },
    am: { title: "የታካሚ መረጃዎች", subtitle: "ለጉብኝትዎ ለመዘጋጀት የሚያስፈልግዎት ሁሉ — በአንድ ቦታ።" },
  },
  [s("resources", "bring")]: {
    en: { eyebrow: "Before you come", title: "What to bring to your visit", items: [
      { text: "A valid ID (or birth certificate for children)" },
      { text: "Previous medical records, results or imaging discs, if you have them" },
      { text: "A list of current medications, vitamins and supplements" },
      { text: "Your insurance card, if applicable" },
      { text: "Questions you want to ask — write them down" },
    ] },
    am: { eyebrow: "ከመምጣትዎ በፊት", title: "ምን መምጣት አለብዎት", items: [
      { text: "ትክክለኛ መታወቂያ (ለልጆች የልደት ሰርተፍኬት)" },
      { text: "ያሉዎት ቀደምት የሕክምና መዝገቦች ወይም ውጤቶች" },
      { text: "በአሁኑ ጊዜ የሚወስዱት መድኃኒቶች ዝርዝር" },
      { text: "የመድን ካርድዎ፣ ያለ ከሆነ" },
      { text: "መጠየቅ የሚፈልጓቸው ጥያቄዎች — ጻፉዎት" },
    ] },
  },
  [s("resources", "insurance")]: {
    en: { eyebrow: "Payment", title: "Insurance & payment", text: "We accept major insurance providers and offer clear, affordable self-pay options. Coverage varies by plan and service — contact our reception with your insurer's details and we will confirm what's covered before your visit." },
    am: { eyebrow: "ክፍያ", title: "መድን እና ክፍያ", text: "ዋና ዋና የመድን አቅራቢዎችን እንቀበላለን እና ግልጽ የራስ ክፍያ አማራጮችን እናቀርባለን። የመድንዎ ዝርዝር ለመክፍል የመቀበያ ቡድናችንን ያግኙ።" },
  },
  [s("resources", "lab")]: {
    en: { eyebrow: "Lab tests", title: "Preparing for lab tests", items: [
      { text: "Ask when booking whether fasting is required — some blood tests need 8–12 hours without food" },
      { text: "Water is usually fine; avoid coffee, juice and chewing gum while fasting" },
      { text: "Bring your previous results so trends can be compared" },
      { text: "Tell the nurse about any medications — some affect results" },
    ] },
    am: { eyebrow: "የላብራቶሪ ምርመራ", title: "ለምርመራ መዘጋጀት", items: [
      { text: "ምግብ ማቆም እንደሚያስፈልግ በመጀመሪያ ይጠይቁ — አንዳንድ የደም ምርመራ 8–12 ሰዓት ያለምግብ ይፈልጋል" },
      { text: "ውሃ መጠጣት ተፈላጊ ነው፤ ቡና እና ጭማቅ ያስወግዱ" },
      { text: "ቀደምት ውጤቶችዎን ይዘው ይምጡ" },
      { text: "መድኃኒቶችዎን ለነርሱ ይንገሩ" },
    ] },
  },
  [s("resources", "rights")]: {
    en: { eyebrow: "Your dignity", title: "Patient rights & privacy", items: [
      { text: "You deserve respectful, confidential care — always" },
      { text: "Your medical information is private and shared only with your consent" },
      { text: "You may ask questions about any part of your care" },
      { text: "You may request a copy of your records and a second opinion" },
    ] },
    am: { eyebrow: "ክብርዎ", title: "የታካሚ መብቶች እና ግላዊነት", items: [
      { text: "ከባህርያትና ከግላዊነት ጋር የተከበረ እንክብካቤ ይገባዎታል" },
      { text: "የሕክምና መረጃዎ ግላዊ ነው" },
      { text: "ስለ እንክብካቤዎ ጥያቄ መጠየቅ ይችላሉ" },
      { text: "የመዝገቦችዎ ቅጂ መጠየቅ ይችላሉ" },
    ] },
  },
  [s("resources", "forms")]: {
    en: { eyebrow: "Downloads", title: "Downloadable forms", subtitle: "Print and complete before your visit to save time. Forms are added by our team as they become available." },
    am: { eyebrow: "ማውረጃዎች", title: "የሚወርዱ ቅጾች", subtitle: "ለጊዜ ቁጠባ ከመምጣትዎ በፊት ያስተካክሉ።" },
  },
  [s("resources", "gallery")]: {
    en: { eyebrow: "Gallery", title: "Inside Universe Medical Center", subtitle: "Our facilities, technology and the people who make it feel like home." },
    am: { eyebrow: "ማዕከል", title: "ዩኒቨርስ ሜዲካል ሴንተር ውስጥ", subtitle: "መሰረተ ልማታችን፣ ቴክኖሎጂያችን እና ሰዎቻችን።" },
  },

  // ── FOOTER ──────────────────────────────────────────────────
  [s("footer", "main")]: {
    en: {
      tagline: "Compassionate, modern care — offering reliable internal medicine, advanced diagnostics, and continuous support to keep you and your family well.",
      quickTitle: "Quick links",
      servicesTitle: "Services",
      contactTitle: "Contact",
      newsletterTitle: "Health tips in your inbox",
      newsletterText: "Occasional, practical health guidance. No spam — unsubscribe anytime.",
      copyright: "© 2026 Universe Medical Center. All rights reserved.",
      creditLabel: "Developed by Joseph James",
      creditUrl: "#",
    },
    am: {
      tagline: "ርኅራኄ የተሞላ ዘመናዊ እንክብካቤ — እርስዎንና ቤተሰብዎን ጤናማ ለማድረግ አስተማማኝ የውስጥ ሕክምና፣ ዘመናዊ ምርመራ እና ቀጣይ ድጋፍ።",
      quickTitle: "ፈጣን አገናኞች",
      servicesTitle: "አገልግሎቶች",
      contactTitle: "አግኙን",
      newsletterTitle: "የጤና ምክሮች በኢሜይልዎ",
      newsletterText: "አልፎ አልፎ ተግባራዊ የጤና መመሪያ። በማንኛውም ጊዜ ማስወገድ ይችላሉ።",
      copyright: "© 2026 ዩኒቨርስ ሜዲካል ሴንተር። መብቱ በህግ የተጠበቀ ነው።",
      creditLabel: "በጆሴፍ ጀምስ የተሰራ",
      creditUrl: "#",
    },
  },
  [s("footer", "disclaimer")]: {
    en: { text: "Information on this site is educational and does not replace professional medical advice. In an emergency, call or visit the clinic immediately." },
    am: { text: "በዚህ ጣቢያ ላይ ያለው መረጃ ለትምህርት ብቻ ነው፤ ባለሙያ የሕክምና ምክርን አይተኩም። በአስቸኳይ ጊዜ ወዲያውኑ ይደውሉ ወይም ክሊኒኩን ይጎብኙ።" },
  },

  // ── ERROR PAGES ─────────────────────────────────────────────
  [s("error", "notfound")]: {
    en: { title: "Page not found", text: "The page you're looking for has moved or never existed. Let's get you back to good health.", cta: "Back to Home" },
    am: { title: "ገጹ አልተገኘም", text: "የሚፈልጉት ገጽ ተዘዋውሯል ወይም አልነበረም። ወደ መነሻ ይመለሱ።", cta: "ወደ መነሻ" },
  },
  [s("error", "serverError")]: {
    en: { title: "Something went wrong", text: "An unexpected error occurred. Please try again — or call us at 0116390354.", cta: "Try again" },
    am: { title: "ችግር ደርሷል", text: "ያልተጠበቀ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።", cta: "እንደገና ይሞክሩ" },
  },
};

export type ContentBundle = Record<string, LocaleData>;

export function mergeSection(page: string, key: string, locale: "en" | "am", overrides?: Record<string, LocaleData>): SectionData {
  const id = `${page}.${key}`;
  const def = CONTENT_DEFAULTS[id]?.[locale] ?? {};
  const over = overrides?.[id]?.[locale];
  if (!over) return def;
  const merged: SectionData = { ...def };
  for (const [k, v] of Object.entries(over)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string") {
      if (v.trim() === "") continue; // empty string = keep default
      merged[k] = v;
    } else {
      merged[k] = v;
    }
  }
  return merged;
}

export function str(data: SectionData, key: string, fallback = ""): string {
  const v = data[key];
  return typeof v === "string" ? v : fallback;
}

export function list(data: SectionData, key: string): Array<Record<string, string>> {
  const v = data[key];
  return Array.isArray(v) ? (v as Array<Record<string, string>>) : [];
}
