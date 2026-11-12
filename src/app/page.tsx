import { SiteApp } from "@/components/site/site-app";
import { getSiteData } from "@/server/site-data";
import { SETTINGS_DEFAULTS } from "@/lib/settings-defaults";
import type { SiteData } from "@/lib/site-types";

export const dynamic = "force-dynamic";

function fallbackData(): SiteData {
  return {
    settings: SETTINGS_DEFAULTS,
    content: {},
    sectionsIndex: {},
    backdrops: {},
    services: [],
    doctors: [],
    packages: [],
    posts: [],
    testimonials: [],
    faqs: [],
    gallery: [],
    branches: [],
  };
}

export default async function Page() {
  let data: SiteData;
  try {
    data = await getSiteData();
  } catch (error) {
    // Database unreachable — serve the site with built-in defaults rather than crashing.
    console.error("[page] failed to load site data:", error);
    data = fallbackData();
  }
  return <SiteApp data={data} />;
}
