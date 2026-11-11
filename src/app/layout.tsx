import type { Metadata, Viewport } from "next";
import { Sora, Inter, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ethiopic",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://universemedical.et";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Universe Medical Center — Better Care for Better Health",
    template: "%s · Universe Medical Center",
  },
  description:
    "Universe Medical Center combines compassionate care with modern medical technology — internal medicine, specialist consultations, laboratory, imaging and 24/7 patient support in Addis Ababa and Ambo, Ethiopia.",
  keywords: [
    "Universe Medical Center",
    "internal medicine Addis Ababa",
    "clinic Ethiopia",
    "laboratory",
    "imaging",
    "Heran Clinic Ambo",
    "ዩኒቨርስ ሜዲካል ሴንተር",
  ],
  applicationName: "Universe Medical Center",
  authors: [{ name: "Universe Medical Center" }],
  creator: "Universe Medical Center",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "am_ET",
    url: siteUrl,
    siteName: "Universe Medical Center",
    title: "Universe Medical Center — Better Care for Better Health",
    description:
      "Compassionate, patient-first care backed by modern diagnostics. Internal medicine, labs, imaging and more in Addis Ababa and Ambo.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Universe Medical Center" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Universe Medical Center — Better Care for Better Health",
    description:
      "Compassionate, patient-first care backed by modern diagnostics in Addis Ababa and Ambo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const medicalClinicJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Universe Medical Center",
  alternateName: "Universe Clinic",
  slogan: "Better Care for Better Health",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/og-image.png`,
  telephone: "+251116390354",
  email: "universeclinic2023@gmail.com",
  medicalSpecialty: ["InternalMedicine", "Cardiovascular", "Pulmonary", "Endocrine"],
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "Lemi Kura Subcity, Woreda 03, Zone 05, Straight 08, Ayat-Bole Arabsa Main Road",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Ambo City, West Shoa",
      addressRegion: "Oromia",
      addressCountry: "ET",
    },
  ],
  availableService: [
    "Internal Medicine Care",
    "Specialist Consultations",
    "Laboratory & Diagnostic Tests",
    "Imaging & Radiology",
    "Patient Care & Emergency Services",
    "Digital Health & Clinic Solutions",
  ].map((name) => ({ "@type": "MedicalProcedure", name })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${inter.variable} ${notoEthiopic.variable} antialiased bg-ink text-ice`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalClinicJsonLd) }}
        />
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
