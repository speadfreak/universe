/**
 * Universe Medical Center — database seed.
 * Creates: super admin, settings, page sections (from content defaults),
 * services, doctors, packages, blog posts, testimonials, FAQs, branches, gallery.
 * Idempotent: safe to run multiple times (upserts by natural keys).
 *
 * Run: bun prisma/seed.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { scryptSync, randomBytes } from "crypto";

/** Prefer a postgres:// URL; fall back to the .env file when the shell exports a non-postgres placeholder. */
function resolveUrl(): string {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL];
  for (const url of candidates) {
    if (url && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) return url;
  }
  try {
    const envFile = readFileSync(path.join(process.cwd(), ".env"), "utf8");
    const m = envFile.match(/^DATABASE_URL="?((?:postgres(?:ql)?:\/\/)[^"\n]+)"?/m);
    if (m) return m[1];
  } catch {}
  return "";
}

const url = resolveUrl();
const prisma = url
  ? new PrismaClient({ datasources: { db: { url } } })
  : new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

// content defaults are plain TS — import via require to reuse the module
 
let CONTENT_DEFAULTS: Record<string, { en: any; am: any }>;
 
let CONTENT_SCHEMA: any[];
async function loadContentModules() {
  // bun can import TS directly
  const schema = await import("../src/lib/content-schema");
  CONTENT_DEFAULTS = schema.CONTENT_DEFAULTS as typeof CONTENT_DEFAULTS;
  CONTENT_SCHEMA = schema.CONTENT_SCHEMA as typeof CONTENT_SCHEMA;
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin_password";
  const name = process.env.ADMIN_NAME || "Super Admin";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ admin exists: ${email}`);
    return;
  }
  await prisma.adminUser.create({
    data: { email, passwordHash: hashPassword(password), name, role: "super_admin" },
  });
  console.log(`✓ super admin created: ${email}`);
}

async function seedSettings() {
  const defaults: Record<string, unknown> = {
    clinicName: "Universe Medical Center",
    tagline: "Better Care for Better Health",
    phone: "0116390354",
    phoneIntl: "+251116390354",
    email: "universeclinic2023@gmail.com",
    addressAddis: "Lemi Kura Subcity, Woreda 03, Zone 05, Straight 08, Ayat-Bole Arabsa Main Road, Addis Ababa, Ethiopia",
    addressAmbo: "Ambo City, West Shoa, Oromia Region (Heran Clinic — established February 2021)",
    hoursEn: "Monday – Saturday: 8:30 AM – 5:30 PM · Sunday: Emergency only",
    hoursAm: "ሰኞ – ቅዳሜ፡ 8:30 – 5:30 · እሁድ፡ አስቸኳይ ብቻ",
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
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value: value as Prisma.InputJsonValue }, update: {} });
  }
  await prisma.setting.upsert({
    where: { key: "socials" },
    create: { key: "socials", value: { facebook: "https://facebook.com/", tiktok: "https://tiktok.com/", google: "https://google.com/maps", linkedin: "https://linkedin.com/" } },
    update: {},
  });
  console.log("✓ settings");
}

async function seedSections() {
  let order = 0;
  for (const pageDef of CONTENT_SCHEMA) {
    for (const sectionDef of pageDef.sections) {
      const id = `${pageDef.page}.${sectionDef.key}`;
      const data = CONTENT_DEFAULTS[id] || { en: {}, am: {} };
      await prisma.pageSection.upsert({
        where: { page_sectionKey: { page: pageDef.page, sectionKey: sectionDef.key } },
        create: { page: pageDef.page, sectionKey: sectionDef.key, data, visible: true, sortOrder: order++ },
        update: {},
      });
    }
  }
  console.log("✓ page sections");
}

async function seedServices() {
  const services = [
    {
      slug: "internal-medicine-care",
      image: "/img/svc-internal-medicine-care.jpg",
      icon: "stethoscope",
      titleEn: "Internal Medicine Care",
      titleAm: "የውስጥ ሕክምና እንክብካቤ",
      taglineEn: "Adult health, handled end-to-end",
      taglineAm: "የአዋቂዎች ጤና፣ ከፍጻሜ እስከ መጨረሻ",
      excerptEn: "Comprehensive diagnosis, treatment, and preventive care for adult diseases by experienced specialists.",
      excerptAm: "በተሞክሮ ባለሙያዎች ለአዋቂዎች በሽታዎች አጠቃላይ ምርመራ፣ ሕክምና እና መከላከያ እንክብካቤ።",
      bodyEn:
        "## Complete adult care\nInternal medicine is the backbone of adult healthcare. Our internists diagnose and manage conditions affecting the heart, lungs, kidneys, liver, hormones, gut, joints and nervous system — coordinating every step of your care.\n\n## What we manage\n- Common and complex infections\n- High blood pressure and heart disease risk\n- Diabetes and endocrine conditions\n- Digestive and liver complaints\n- Respiratory conditions including asthma\n- Preventive screening and lifestyle counselling\n\n## Prevention first\nMany adult conditions are easiest to treat when found early. Routine checkups, blood work and imaging help us spot problems before symptoms appear — and our team will build a follow-up plan that fits your life.",
      bodyAm:
        "## አጠቃላይ የአዋቂዎች እንክብካቤ\nየውስጥ ሕክምና የአዋቂዎች ጤና ዋና መሰረት ነው። የልብ፣ የሳምባ፣ የኩላሊት፣ የጉበት፣ የሆርሞን፣ የሆዳና አንጀት፣ የመገጣጠሚያ እና የነርቭ ሥርዓት ሕመሞችን እናያያምን።\n\n## መከላከል ቀድሞ\nብዙ የአዋቂዎች በሽታዎች በጊዜያቸው ሲገኙ ሕክምናቸው ቀላል ነው። መደበኛ ምርመራዎች እኛን ለመርዳት ይረዳሉ።",
      features: [
        { en: "Full physical examinations & health review", am: "ሙሉ የአካል ምርመራ" },
        { en: "Chronic disease management (diabetes, hypertension)", am: "የሥር የሰፈሩ በሽታዎች አስተዳደር" },
        { en: "Preventive screening & vaccinations advice", am: "የመከላከያ ምርመራና ምክር" },
        { en: "Referral coordination with sub-specialists", am: "ከስድስት-ስፔሻሊስቶች ጋር የሪፈራል ዝግጅት" },
      ],
      process: [
        { en: "Book online or by phone — walk-ins are welcome.", am: "በመስመር ላይ ወይም በስልክ ይያዙ — በቀጥታ መምጣትም ይቻላል።" },
        { en: "Consultation with history-taking and examination.", am: "ከታሪክ ወስዳልና ምርመራ ጋር ውይይት።" },
        { en: "On-site lab and imaging if needed.", am: "አስፈላጊ ከሆነ ላብራቶሪ እና ምስል።" },
        { en: "Diagnosis explained clearly + treatment plan.", am: "ምርመራው በግልጽ ይገለጻል + የሕክምና እቅድ።" },
        { en: "Follow-up scheduled before you leave.", am: "ከመሄድዎ በፊት ተከታታይ ቀን ይያዛል።" },
      ],
      expect: [
        { en: "Your first visit takes about 30–45 minutes.", am: "የመጀመሪያ ጉብኝትዎ ከ30–45 ደቂቃዎች ይወስዳል።" },
        { en: "Bring previous results and your medication list.", am: "ቀደምት ውጤቶችዎንና የመድኃኒት ዝርዝርዎን ይዘው ይምጡ።" },
        { en: "Fasting may be needed for some blood tests — staff will tell you when booking.", am: "ለአንዳንድ የደም ምርመራ ማዝናት ሊያስፈልግ ይችላል።" },
      ],
      faqs: [
        { q: { en: "Do I need an appointment?", am: "ቀን ማስያዝ ያስፈልገኛል?" }, a: { en: "Walk-ins are welcome, but booking guarantees a shorter wait. Call 0116390354 or use the online form.", am: "በቀጥታ መምጣት ይቻላል፤ ግን ቀን ማስያዝ የመጠበቅ ጊዜዎን ያሳጥራል።" } },
        { q: { en: "Can I choose my doctor?", am: "ሐኪሜን መምረጥ እችላለሁ?" }, a: { en: "Yes — pick a doctor during booking, or choose “No preference” for the first available specialist.", am: "አዎ — በማስያዝ ጊዜ ሐኪም ይምረጡ።" } },
      ],
      order: 0,
    },
    {
      slug: "specialist-consultations",
      image: "/img/svc-specialist-consultations.jpg",
      icon: "user-round-check",
      titleEn: "Specialist Consultations",
      titleAm: "የስፔሻሊስት ምክክር",
      taglineEn: "The right expert for your concern",
      taglineAm: "ለጉዳይዎ ትክክለኛ ባለሙያ",
      excerptEn: "Heart, lung, kidney, liver, endocrine, neurology, gastroenterology, and rheumatology care tailored to your needs.",
      excerptAm: "ለፍላጎትዎ የተስተካከለ የልብ፣ የሳምባ፣ የኩላሊት፣ የጉበት፣ የሆርሞን፣ የነርቭ፣ የሆዳና አንጀት እና የመገጣጠሚያ እንክብካቤ።",
      bodyEn:
        "## Focused expertise, coordinated care\nWhen a condition needs deeper expertise, our specialist consultations connect you with physicians focused on specific body systems.\n\n## Areas we cover\n- **Cardiology** — heart and blood pressure\n- **Pulmonology** — lungs and breathing\n- **Nephrology** — kidneys\n- **Hepatology** — liver\n- **Endocrinology** — hormones, thyroid, diabetes\n- **Neurology** — nerves, headache, seizures\n- **Gastroenterology** — stomach and gut\n- **Rheumatology** — joints and autoimmune conditions\n\nYour internist remains your home base — results and treatment plans are shared across your care team so nothing falls through the cracks.",
      bodyAm:
        "## የተመረጠ ክህሎት፣ የተገናኘ እንክብካቤ\nሕመም የበለጠ ክህሎት ሲፈልግ ወደ ስፔሻሊስቶቻችን እናደርስዎታለን። የውስጥ ሕክምና ሐኪምዎ ሁልጊዜ መነሻዎ ይሆናል።",
      features: [
        { en: "Sub-specialist physicians across nine fields", am: "በዘጠኝ መስኮች ስድስት-ስፔሻሊስቶች" },
        { en: "Shared records between your care team", am: "በእንክብካቤ ቡድን መካከል የተገናኘ መዝገብ" },
        { en: "Second-opinion reviews", am: "የሁለተኛ አስተያየት ግምገማ" },
        { en: "Interpreter support (English/Amharic)", am: "የቋንቋ ድጋፍ (እንግሊዝኛ/አማርኛ)" },
      ],
      process: [
        { en: "Your internist or reception identifies the right specialist.", am: "ሐኪምዎ ወይም መቀበያ ትክክለኛውን ስፔሻሊስት ይለያል።" },
        { en: "Bring prior results — we build on what exists.", am: "ቀደምት ውጤቶችዎን ይዘው ይምጡ።" },
        { en: "Focused consultation and examination.", am: "የተመረጠ ምክክር እና ምርመራ።" },
        { en: "Clear plan communicated to you and your family doctor.", am: "ግልጽ እቅድ ለእርስዎና ለቤተሰብ ሐኪምዎ ይገለጻል።" },
      ],
      expect: [
        { en: "Please arrive 10 minutes early.", am: "እባክዎ 10 ደቂቃ በፊት ይድረሱ።" },
        { en: "Bring your ID, records and medication list.", am: "መታወቂያዎን፣ መዝገቦችዎን እና መድኃኒት ዝርዝርዎን ይዘው ይምጡ።" },
      ],
      faqs: [
        { q: { en: "Do I need a referral?", am: "ሪፈራል ያስፈልገኛል?" }, a: { en: "No referral is required — but bringing one (or previous results) helps us help you faster.", am: "ሪፈራል አያስፈልግም — ግን የነበሩ ውጤቶች ይረዳሉ።" } },
      ],
      order: 1,
    },
    {
      slug: "laboratory-diagnostic-tests",
      image: "/img/svc-laboratory-diagnostic-tests.jpg",
      icon: "flask-conical",
      titleEn: "Laboratory & Diagnostic Tests",
      titleAm: "ላብራቶሪ እና ምርመራ",
      taglineEn: "Accurate answers, fast",
      taglineAm: "ትክክለኛ መልስ፣ በፍጥነት",
      excerptEn: "Modern lab including blood tests, hormone panels and cancer biomarkers for accurate results.",
      excerptAm: "ዘመናዊ ላብ በደም ምርመራ፣ በሆርሞን ጥናት እና በካንሰር ባዮማርከር ትክክለኛ ውጤት።",
      bodyEn:
        "## Modern diagnostics under one roof\nOur laboratory runs on modern analyzers with strict quality control, covering routine and advanced testing.\n\n## Tests available\n- Complete blood count and blood chemistry\n- Hormone panels (thyroid, fertility, adrenal)\n- Cancer biomarkers and tumor markers\n- Infection screening (malaria, typhoid, hepatitis, HIV)\n- Urinalysis, stool analysis and parasites\n- Cardiac and inflammatory markers\n\n## Speed and accuracy\nRoutine results are typically ready the same day; specialized panels may take longer — our staff will tell you exactly when to expect yours, and results feed straight into your medical record.",
      bodyAm:
        "## በአንድ ጣቢያ ዘመናዊ ምርመራ\nላብራቶሪያችን በዘመናዊ መሣሪያዎች ይሰራል። መደበኛና የላቀ ምርመራዎች ይኖራሉ። ውጤቶች በፍጥነት ይዘጋጃሉ።",
      features: [
        { en: "Same-day results for most routine tests", am: "ለአብዛኞቹ መደበኛ ምርመራዎች የዚህ ቀን ውጤት" },
        { en: "Hormone panels and cancer biomarkers", am: "የሆርሞን ጥናቶች እና ካንሰር ባዮማርከሮች" },
        { en: "Strict daily quality control", am: "የዕለት ጥራት ቁጥጥር" },
        { en: "Results linked to your patient record", am: "ውጤቶች ከታካሚ መዝገብዎ ጋር የተገናኘ" },
      ],
      process: [
        { en: "Your clinician orders the test (or request a checkup).", am: "ሐኪምዎ ምርመራ ይጠይቃል።" },
        { en: "Sample collected at the lab — usually within minutes.", am: "ናሙና በላብራቶሪ ይወሰዳል።" },
        { en: "Analysis with quality-controlled equipment.", am: "በጥራት የተጠበቁ መሣሪያዎች ትንተና።" },
        { en: "Results explained by your clinician.", am: "ውጤቱ በሐኪምዎ ይተረጎማል።" },
      ],
      expect: [
        { en: "Ask when booking if fasting is required for your test.", am: "ማዝናት እንደሚያስፈልግ በማስያዝ ጊዜ ይጠይቁ።" },
        { en: "Drink water unless instructed otherwise.", am: "ካልተጠየቀ በስተቀር ውሃ ይጠጡ።" },
      ],
      faqs: [
        { q: { en: "When will I get my results?", am: "ውጤቴ መቼ ይወጣል?" }, a: { en: "Most routine tests are ready the same day. Specialized panels may take longer — staff will tell you the exact time.", am: "አብዛኞቹ የዚህ ቀን ናቸው። ልዩ ምርመራዎች ጊዜ ሊወስዱ ይችላሉ።" } },
        { q: { en: "Do I need to fast?", am: "ማዝናት ያስፈልገኛል?" }, a: { en: "Some tests need 8–12 hours without food. Our team confirms when you book.", am: "አንዳንድ ምርመራዎች 8–12 ሰዓት ያለምግብ ይፈልጋሉ።" } },
      ],
      order: 2,
    },
    {
      slug: "imaging-radiology",
      image: "/img/svc-imaging-radiology.jpg",
      icon: "scan-heart",
      titleEn: "Imaging & Radiology",
      titleAm: "ምስል እና ራዲዮሎጂ",
      taglineEn: "See clearly, decide confidently",
      taglineAm: "በግልጽ ይመልከቱ፣ በእምነት ይወስኑ",
      excerptEn: "Digital X-ray, 3D/4D ultrasound, echocardiography, doppler, ECG, and advanced imaging via partner centers.",
      excerptAm: "ዲጂታል ኤክስሬይ፣ 3D/4D ኣስርጣጥ፣ ኢኮካርዲዮግራፊ፣ ዶፕለር፣ ECG እና በአጋር ማዕከላት የላቀ ምስል።",
      bodyEn:
        "## From X-ray to echocardiography\nImaging turns symptoms into answers. Our radiology suite offers:\n\n- **Digital X-ray** — instant, low-dose imaging\n- **3D/4D ultrasound** — obstetric and general\n- **Echocardiography** — heart structure and function\n- **Doppler studies** — blood flow assessment\n- **ECG** — heart rhythm in minutes\n- Advanced CT/MRI via trusted partner centers, arranged for you\n\n## Reports you can act on\nEvery study is reported promptly and reviewed with your clinician, so your diagnosis and treatment never wait on paperwork.",
      bodyAm:
        "## ከኤክስሬይ እስከ ኢኮካርዲዮግራፊ\nምስል ምልክቶችን ወደ መልስ ይቀይራል። ዲጂታል ኤክስሬይ፣ 3D/4D ኣስርጣጥ፣ ኢኮካርዲዮግራፊ፣ ዶፕለር፣ ECG እና በአጋር ማዕከላት CT/MRI እናቀርባለን።",
      features: [
        { en: "Digital X-ray with instant processing", am: "ዲጂታል ኤክስሬይ በፍጥነት" },
        { en: "3D/4D ultrasound and doppler", am: "3D/4D ኣስርጣጥ እና ዶፕለር" },
        { en: "Echocardiography and ECG", am: "ኢኮካርዲዮግራፊ እና ECG" },
        { en: "CT/MRI arranged via partner centers", am: "CT/MRI በአጋር ማዕከላት" },
      ],
      process: [
        { en: "Clinician orders the study.", am: "ሐኪምዎ ምስል ይጠይቃል።" },
        { en: "Imaging performed in our radiology suite.", am: "በራዲዮሎጂ ክፍላችን ይካሄዳል።" },
        { en: "Radiologist/clinician reviews the images.", am: "ራዲዮሎጂስት ይመረምራል።" },
        { en: "Findings explained at your follow-up.", am: "ውጤቱ በተከታታይ ጊዜዎ ይገለጻል።" },
      ],
      expect: [
        { en: "Wear comfortable clothing without metal.", am: "ብረት የሌለው ምቹ አልባሳት ይለብሱ።" },
        { en: "Pregnant? Tell the technologist before any imaging.", am: "እርግዝና ካለብዎ ከመርመሩ በፊት ይንገሩ።" },
      ],
      faqs: [
        { q: { en: "Is X-ray safe?", am: "ኤክስሬይ አስተማማኝ ነው?" }, a: { en: "Modern digital X-ray uses very low doses. We always weigh benefit and safety, and avoid imaging in pregnancy unless essential.", am: "ዘመናዊ ኤክስሬይ በጣም ያነሰ መጠን ይጠቀማል።" } },
      ],
      order: 3,
    },
    {
      slug: "patient-care-emergency",
      image: "/img/svc-patient-care-emergency.jpg",
      icon: "siren",
      titleEn: "Patient Care & Emergency Services",
      titleAm: "የታካሚ እንክብካቤ እና አስቸኳይ አገልግሎት",
      taglineEn: "Here when it matters most",
      taglineAm: "በወሳኝ ጊዜ እዚህ ነን",
      excerptEn: "Round-the-clock medical support, urgent care, minor procedures, and attentive nursing services.",
      excerptAm: "የ24 ሰዓት የሕክምና ድጋፍ፣ አስቸኳይ እንክብካቤ፣ ቀላል ሥርዓቶች እና ትኩረት የሚሰጥ የነርሲንግ አገልግሎት።",
      bodyEn:
        "## Always available for patients\nEmergencies don't schedule themselves. Our team provides urgent medical support, minor procedures and attentive in-clinic nursing care.\n\n## What we handle\n- Urgent assessment and stabilization\n- Minor injuries, wounds and dressings\n- Injections, infusions and nebulization\n- Observation and monitoring\n- Referral and ambulance coordination for higher-level care\n\n## In a life-threatening emergency\ncall us immediately at 0116390354 or come straight to the clinic. If the situation is beyond clinic capability, our team stabilizes and transfers you to the nearest emergency department without delay.",
      bodyAm:
        "## ለታካሚዎች ሁልጊዜ ዝግጁ\nአስቸኳይ አደጋዎች ቀን አይይዙም። አስቸኳይ ምርመራ፣ ቀላል ሥርዓቶች እና ንክንፈር የሚሆን የነርሲንግ አገልግሎት እንሰጣለን። በሕይወት ላይ የሚነካ አደጋ ሆኖ ካገኙ 0116390354 ይደውሉ ወይም ወዲያውኑ ይምጡ።",
      features: [
        { en: "Urgent walk-in assessment", am: "የአስቸኳይ ምርመራ" },
        { en: "Minor procedures and wound care", am: "ቀላል ሥርዓቶች እና የቁሥል እንክብካቤ" },
        { en: "Injections, infusions, nebulization", am: "ግብር፣ መመገቢያ፣ ኔቡላይዜሽን" },
        { en: "Transfer coordination to higher-level care", am: "ወደ ላቀ ደረጃ እንክብካቤ የማስተላለፍ ዝግጅት" },
      ],
      process: [
        { en: "Arrive (or call) — triage identifies urgency immediately.", am: "ይምጡ (ወይም ይደውሉ) — ወሳኝነቱ ወዲያውኑ ይለያል።" },
        { en: "Stabilization and urgent treatment.", am: "ማረጋጋት እና አስቸኳይ ሕክምና።" },
        { en: "Decision: treat here, observe, or transfer.", am: "ውሳኔ፡ ሕክምና፣ ክትትል ወይም ማስተላለፍ።" },
        { en: "Clear handover and follow-up plan.", am: "ግልጽ እቅድ።" },
      ],
      expect: [
        { en: "Life-threatening cases are always seen first.", am: "ከባድ አደጋዎች ቅድሚያ ይሰጣቸዋል።" },
        { en: "Bring any medications the patient has taken.", am: "ታካሚው የወሰዳቸውን መድኃኒቶች ይዘው ይምጡ።" },
      ],
      faqs: [
        { q: { en: "What counts as an emergency?", am: "ምን አስቸኳይ ይባላል?" }, a: { en: "Chest pain, severe breathing difficulty, unconsciousness, heavy bleeding, stroke signs and serious injuries — come immediately or call 0116390354.", am: "የደረት ሕመም፣ ከባድ የትንፋሽ ችግር፣ ማወቅ አለመቻል፣ ከባድ ደም መፍሰስ — ወዲያውኑ ይምጡ ወይም ይደውሉ።" } },
      ],
      order: 4,
    },
    {
      slug: "digital-health-clinic-solutions",
      image: "/img/svc-digital-health-clinic-solutions.jpg",
      icon: "monitor-smartphone",
      titleEn: "Digital Health & Clinic Solutions",
      titleAm: "ዲጂታል ጤና እና የክሊኒክ መፍትሔዎች",
      taglineEn: "Modern tools for modern care",
      taglineAm: "ለዘመናዊ እንክብካቤ ዘመናዊ መሣሪያዎች",
      excerptEn: "Tools for easy scheduling, billing, patient management, multi-language support, and corporate health partnerships.",
      excerptAm: "ለቀላል የቀን ማስያዝ፣ ሂሳብ፣ የታካሚ አስተዳደር፣ የብዙ ቋንቋ ድጋፍ እና የድርጅት ጤና አጋርነት መሣሪያዎች።",
      bodyEn:
        "## A clinic that speaks digital\nUniverse Medical Center invests in systems that remove friction from your healthcare:\n\n- **Online booking** — this website schedules real appointment slots\n- **Digital records** — your results and history stay with your care team\n- **Multi-language support** — English and Amharic across the experience\n- **Corporate health partnerships** — employee screening days, priority scheduling and tailored packages for organizations\n\n## Built to connect\nOur systems are architected to integrate with hospital management systems, so as our digital services grow, your care stays seamless.",
      bodyAm:
        "## ዲጂታል የሆነ ክሊኒክ\nዩኒቨርስ በመስመር ላይ የቀን ማስያዝ፣ ዲጂታል መዝገቦች፣ ብዙ ቋንቋ ድጋፍ እና የድርጅት ጤና አጋርነት በመጠቀም የጤና አገልግሎትዎን ቀላል ያደርጋል።",
      features: [
        { en: "Online appointment scheduling", am: "በመስመር ላይ የቀን ማስያዝ" },
        { en: "Digital patient records", am: "ዲጂታል የታካሚ መዝገቦች" },
        { en: "English & Amharic support", am: "የእንግሊዝኛ እና አማርኛ ድጋፍ" },
        { en: "Corporate health partnership programs", am: "የድርጅት ጤና አጋርነት ፕሮግራሞች" },
      ],
      process: [
        { en: "Register online or at reception.", am: "በመስመር ላይ ወይም በመቀበያ ይመዝገቡ።" },
        { en: "Book, reschedule or follow up digitally.", am: "ዲጂታል በሆነ መንገድ ይያዙ ወይም ይከታተሉ።" },
        { en: "Organizations: request a partnership proposal.", am: "ድርጅቶች፡ የአጋርነት ፕሮፖዛል ይጠይቁ።" },
      ],
      expect: [
        { en: "Your data is handled confidentially and minimally.", am: "መረጃዎ በሚስጥር ይያዛል።" },
      ],
      faqs: [
        { q: { en: "Can my company partner with the clinic?", am: "ድርጅቴ ከክሊኒኩ ጋር መተባበር ይችላል?" }, a: { en: "Yes — contact us via the contact form or call 0116390354 to design a corporate program.", am: "አዎ — በአግኙን ገጽ ወይም በስልክ ያግኙን።" } },
      ],
      order: 5,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({ where: { slug: svc.slug }, create: svc, update: {} });
  }
  console.log(`✓ services (${services.length})`);
}

async function seedDoctors() {
  const doctors = [
    { nameEn: "Dr. Placeholder — Internal Medicine", specialtyEn: "Internal Medicine", credentials: "MD, Internal Medicine (verification in progress)", bioEn: "Placeholder profile. This slot will be replaced with a verified physician profile, photo and credentials by the communications team.", languages: "English, Amharic", order: 0 },
    { nameEn: "Dr. Placeholder — Cardiology", specialtyEn: "Cardiology", credentials: "MD, Cardiology (verification in progress)", bioEn: "Placeholder profile — awaiting verified details and consent for publication.", languages: "English, Amharic", order: 1 },
    { nameEn: "Dr. Placeholder — Pulmonology", specialtyEn: "Pulmonology", credentials: "MD, Pulmonology (verification in progress)", bioEn: "Placeholder profile — awaiting verified details and consent for publication.", languages: "English, Amharic", order: 2 },
    { nameEn: "Dr. Placeholder — Endocrinology", specialtyEn: "Endocrinology", credentials: "MD, Endocrinology (verification in progress)", bioEn: "Placeholder profile — awaiting verified details and consent for publication.", languages: "English, Amharic", order: 3 },
    { nameEn: "Dr. Placeholder — Gastroenterology", specialtyEn: "Gastroenterology", credentials: "MD, Gastroenterology (verification in progress)", bioEn: "Placeholder profile — awaiting verified details and consent for publication.", languages: "English, Amharic", order: 4 },
    { nameEn: "Dr. Placeholder — Neurology", specialtyEn: "Neurology", credentials: "MD, Neurology (verification in progress)", bioEn: "Placeholder profile — awaiting verified details and consent for publication.", languages: "English, Amharic", order: 5 },
  ];
  let count = 0;
  for (const d of doctors) {
    const exists = await prisma.doctor.findFirst({ where: { nameEn: d.nameEn } });
    if (!exists) {
      await prisma.doctor.create({ data: { ...d, isPlaceholder: true } });
      count++;
    }
  }
  console.log(`✓ doctors (${count} created)`);
}

async function seedPackages() {
  const packages = [
    { nameEn: "Basic Health Check", nameAm: "መሠረታዊ የጤና ምርመራ", descEn: "Essential screening for everyday health.", descAm: "ለዕለት ተዕለት ጤና አስፈላጊ ምርመራ።", items: [{ en: "Physical examination & vitals", am: "የአካል ምርመራ" }, { en: "Complete blood count", am: "የደም ምርመራ" }, { en: "Blood sugar & cholesterol", am: "የስኳር እና ኮሌስትሮል" }, { en: "Urinalysis", am: "የሽንት ምርመራ" }], price: "", featured: false, order: 0 },
    { nameEn: "Executive Checkup", nameAm: "የኤጄኪዩቲቭ ምርመራ", descEn: "Our most comprehensive annual screen for busy lives.", descAm: "በጣም አጠቃላይ ዓመታዊ ምርመራ።", items: [{ en: "Everything in Basic", am: "የመሠረታዊ ሁሉም" }, { en: "Liver & kidney function", am: "የጉበት እና ኩላሊት ሥራ" }, { en: "Thyroid panel", am: "የታይሮይድ ምርመራ" }, { en: "ECG & chest X-ray", am: "ECG እና የደረት ኤክስሬይ" }, { en: "Abdominal ultrasound", am: "የሆድ ኣስርጣጥ" }], price: "", featured: true, order: 1 },
    { nameEn: "Cardiac Screen", nameAm: "የልብ ምርመራ", descEn: "Heart-focused assessment for peace of mind.", descAm: "ለልብ የተመረጠ ምርመራ።", items: [{ en: "Blood pressure & cholesterol panel", am: "የደም ግፊት እና ኮሌስትሮል" }, { en: "ECG", am: "ECG" }, { en: "Echocardiography", am: "ኢኮካርዲዮግራፊ" }, { en: "Cardiology consultation", am: "የካርዲዮሎጂ ምክክር" }], price: "", featured: false, order: 2 },
    { nameEn: "Diabetes Care Package", nameAm: "የስኳር እንክብካቤ ጥቅል", descEn: "Monitoring bundle for living well with diabetes.", descAm: "ከስኳር ጋር ለመኖር የክትትል ጥቅል።", items: [{ en: "Fasting blood sugar & HbA1c", am: "የስኳር ምርመራ" }, { en: "Kidney function tests", am: "የኩላሊት ምርመራ" }, { en: "Eye & foot screening guidance", am: "የዓይን እና እግር ምርመራ መመሪያ" }, { en: "Diet & lifestyle counselling", am: "የአመጋገብ ምክር" }], price: "", featured: false, order: 3 },
    { nameEn: "Women's Health Package", nameAm: "የሴቶች ጤና ጥቅል", descEn: "Preventive care tailored to women's needs.", descAm: "ለሴቶች ፍላጎት የተሰራ መከላከያ እንክብካቤ።", items: [{ en: "General health screen", am: "አጠቃላይ ምርመራ" }, { en: "Hormone panel", am: "የሆርሞን ምርመራ" }, { en: "Obstetric ultrasound", am: "የእርግዝና ኣስርጣጥ" }, { en: "Physician consultation", am: "የሐኪም ምክክር" }], price: "", featured: false, order: 4 },
    { nameEn: "Corporate Health Program", nameAm: "የድርጅት ጤና ፕሮግራም", descEn: "Custom screening days and packages for organizations.", descAm: "ለድርጅቶች የተስተካከሉ የምርመራ ቀናት።", items: [{ en: "On-site screening day", am: "በሥፍራው ላይ የምርመራ ቀን" }, { en: "Group rates", am: "የቡድን ዋጋ" }, { en: "Priority scheduling", am: "ቅድሚያ የቀን ማስያዝ" }, { en: "Health summary reports", am: "የጤና ሪፖርት" }], price: "", featured: false, order: 5 },
  ];
  let count = 0;
  for (const p of packages) {
    const exists = await prisma.package.findFirst({ where: { nameEn: p.nameEn } });
    if (!exists) {
      await prisma.package.create({ data: p });
      count++;
    }
  }
  console.log(`✓ packages (${count} created)`);
}

async function seedPosts() {
  const posts = [
    {
      slug: "universe-medical-center-comprehensive-adult-care-in-addis-ababa",
      title: "Universe Medical Center – Comprehensive Adult Care in Addis Ababa",
      excerpt: "At Universe Medical Center, we're dedicated to providing exceptional, patient-centered healthcare for adults in Addis Ababa.",
      category: "Your Health",
      tags: ["adult care", "checkup", "Addis Ababa"],
      coverImage: "/img/blog-1.jpg",
      file: "post-1.md",
      daysAgo: 100,
    },
    {
      slug: "comprehensive-internal-medicine-care-in-addis-ababa",
      title: "Comprehensive Internal Medicine Care in Addis Ababa: Your Path to Better Health",
      excerpt: "Universe Medical Center is your trusted destination for high-quality healthcare in Addis Ababa. Our clinic offers…",
      category: "Internal Medicine",
      tags: ["internal medicine", "specialists", "diagnostics"],
      coverImage: "/img/blog-2.jpg",
      file: "post-2.md",
      daysAgo: 106,
    },
    {
      slug: "managing-chronic-conditions-taking-control-of-your-health",
      title: "Managing Chronic Conditions: Taking Control of Your Health",
      excerpt: "Living with a chronic condition like diabetes, high blood pressure, asthma, or heart disease can feel…",
      category: "Your Health",
      tags: ["chronic disease", "diabetes", "lifestyle"],
      coverImage: "/img/blog-3.jpg",
      file: "post-3.md",
      daysAgo: 106,
    },
  ];

  let count = 0;
  for (const post of posts) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (exists) continue;
    const filePath = path.join(process.cwd(), "content", "blog", post.file);
    if (!existsSync(filePath)) {
      console.warn(`⚠ missing content file: ${filePath}`);
      continue;
    }
    const content = readFileSync(filePath, "utf-8");
    const words = content.split(/\s+/).length;
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content,
        category: post.category,
        tags: post.tags,
        coverImage: post.coverImage,
        readingTime: Math.max(3, Math.round(words / 200)),
        status: "published",
        publishedAt: new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000),
        seoTitle: post.title,
        seoDescription: post.excerpt.slice(0, 155),
      },
    });
    count++;
  }
  console.log(`✓ blog posts (${count} created)`);
}

async function seedTestimonials() {
  const testimonials = [
    { name: "Sample Patient — A. T.", role: "Addis Ababa · Checkup", quote: "Placeholder testimonial slot. Replace with a verified patient story (with written consent) from the admin panel.", rating: 5, order: 0 },
    { name: "Sample Patient — M. G.", role: "Ambo · Follow-up", quote: "Placeholder testimonial slot. Replace with a verified patient story (with written consent) from the admin panel.", rating: 5, order: 1 },
    { name: "Sample Patient — S. K.", role: "Addis Ababa · Lab & Imaging", quote: "Placeholder testimonial slot. Replace with a verified patient story (with written consent) from the admin panel.", rating: 4, order: 2 },
    { name: "Sample Patient — B. L.", role: "Addis Ababa · Consultation", quote: "Placeholder testimonial slot. Replace with a verified patient story (with written consent) from the admin panel.", rating: 5, order: 3 },
  ];
  let count = 0;
  for (const t of testimonials) {
    const exists = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!exists) {
      await prisma.testimonial.create({ data: { ...t, isPlaceholder: true } });
      count++;
    }
  }
  console.log(`✓ testimonials (${count} created)`);
}

async function seedFaqs() {
  const faqPath = path.join(process.cwd(), "content", "faqs.json");
  if (!existsSync(faqPath)) {
    console.warn("⚠ content/faqs.json not found — skipping FAQ seed");
    return;
  }
  const faqs = JSON.parse(readFileSync(faqPath, "utf-8")) as Array<{
    questionEn: string; answerEn: string; questionAm: string; answerAm: string; category: string;
  }>;
  let count = 0;
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    const exists = await prisma.faq.findFirst({ where: { questionEn: f.questionEn } });
    if (!exists) {
      await prisma.faq.create({ data: { ...f, order: i } });
      count++;
    }
  }
  console.log(`✓ FAQs (${count} created)`);
}

async function seedBranches() {
  const branches = [
    {
      nameEn: "Addis Ababa Branch (Universe Medical Center)",
      nameAm: "የአዲስ አበባ ቅርንጫፍ (ዩኒቨርስ ሜዲካል ሴንተር)",
      addressEn: "Lemi Kura Subcity, Woreda 03, Zone 05, Straight 08, Ayat-Bole Arabsa Main Road, Addis Ababa, Ethiopia",
      addressAm: "ለሚ ቁራ ክፍለ ከተማ፣ ወረዳ 03፣ ዞን 05፣ ቀጥታ 08፣ አያት-ቦሌ ዋና መንገድ፣ አዲስ አበባ",
      phone: "0116390354",
      hours: "Monday – Saturday: 8:30 AM – 5:30 PM · Sunday: Emergency only",
      hoursAm: "ሰኞ – ቅዳሜ፡ 8:30 – 5:30 · እሁድ፡ አስቸኳይ ብቻ",
      mapEmbedUrl: "",
      established: "Opened August 2022",
      noteEn: "The main Universe Medical Center branch.",
      order: 0,
    },
    {
      nameEn: "Ambo Branch (Heran Clinic)",
      nameAm: "የአምቦ ቅርንጫፍ (ሄራን ክሊኒክ)",
      addressEn: "Ambo City, West Shoa, Oromia Region, Ethiopia",
      addressAm: "አምቦ ከተማ፣ ምዕራብ ሸዋ፣ ኦሮሚያ",
      phone: "0116390354",
      hours: "Monday – Saturday: 8:30 AM – 5:30 PM · Sunday: Emergency only",
      hoursAm: "ሰኞ – ቅዳሜ፡ 8:30 – 5:30 · እሁድ፡ አስቸኳይ ብቻ",
      mapEmbedUrl: "",
      established: "Established February 2021",
      noteEn: "Heran Clinic — the first branch, serving Ambo City.",
      order: 1,
    },
  ];
  for (const b of branches) {
    const exists = await prisma.branch.findFirst({ where: { nameEn: b.nameEn } });
    if (!exists) await prisma.branch.create({ data: b });
  }
  console.log("✓ branches (map embed URLs are set by the super admin in Settings/Branches)");
}

async function seedGallery() {
  const items = [
    { title: "Reception & waiting lounge", type: "image", url: "/img/gallery-1.jpg", alt: "Bright modern reception and waiting lounge at Universe Medical Center", order: 0 },
    { title: "Imaging & radiology suite", type: "image", url: "/img/gallery-2.jpg", alt: "Digital X-ray and ultrasound imaging room", order: 1 },
    { title: "Modern diagnostic laboratory", type: "image", url: "/img/gallery-3.jpg", alt: "Laboratory with modern analyzers and sample tubes", order: 2 },
    { title: "Consultation room", type: "image", url: "/img/gallery-4.jpg", alt: "Doctor's consultation room with examination bed", order: 3 },
  ];
  let count = 0;
  for (const g of items) {
    const exists = await prisma.galleryItem.findFirst({ where: { url: g.url } });
    if (!exists) {
      await prisma.galleryItem.create({ data: g });
      count++;
    }
  }
  console.log(`✓ gallery (${count} created)`);
}

async function main() {
  await loadContentModules();
  await seedAdmin();
  await seedSettings();
  await seedSections();
  await seedServices();
  await seedDoctors();
  await seedPackages();
  await seedPosts();
  await seedTestimonials();
  await seedFaqs();
  await seedBranches();
  await seedGallery();
  console.log("\n🌱 Seed complete. Sign in at /#/admin with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
