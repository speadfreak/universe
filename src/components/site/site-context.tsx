"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SectionData } from "@/lib/content-schema";
import { mergeSection } from "@/lib/content-schema";
import { t as translate } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-types";
import type { SiteSettings } from "@/lib/settings-defaults";

export type Locale = "en" | "am";

export type RouteState = {
  path: string; // normalized, e.g. "/services/internal-medicine-care"
  segments: string[];
};

export const lenisRef: { current: { scrollTo: (target: number | string, opts?: Record<string, unknown>) => void } | null } = {
  current: null,
};

type SiteCtxValue = {
  data: SiteData;
  settings: SiteSettings;
  locale: Locale;
  setLocale: (l: Locale) => void;
  route: RouteState;
  navigate: (path: string) => void;
  scrollToId: (id: string) => void;
  t: (key: string) => string;
  L: (en: string, am: string) => string;
  section: (page: string, key: string) => SectionData;
  visible: (page: string, key: string) => boolean;
};

const SiteCtx = createContext<SiteCtxValue | null>(null);

export function useSite(): SiteCtxValue {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

function parseHash(): RouteState {
  const raw = window.location.hash.replace(/^#/, "");
  const path = raw.split("?")[0] || "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return { path: normalized, segments: normalized.split("/").filter(Boolean) };
}

export const TITLES: Record<string, string> = {
  "/": "Universe Medical Center — Better Care for Better Health",
  "/about": "About Us",
  "/services": "Our Services",
  "/doctors": "Our Doctors",
  "/packages": "Health Packages",
  "/blog": "Health Journal",
  "/contact": "Contact Us",
  "/book": "Book an Appointment",
  "/resources": "Patient Resources",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/admin": "Admin Panel",
};

export function SiteProvider({ data, children }: { data: SiteData; children: React.ReactNode }) {
  const [route, setRoute] = useState<RouteState>({ path: "/", segments: [] });
  const [locale, setLocaleState] = useState<Locale>(data.settings.defaultLocale || "en");
  const firstRun = useRef(true);

  // initial route
  useEffect(() => {
    setRoute(parseHash());
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // restore locale
  useEffect(() => {
    const saved = window.localStorage.getItem("umc-locale");
    if (saved === "en" || saved === "am") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "am" ? "am" : "en";
  }, [locale]);

  // document title per route
  useEffect(() => {
    const seg = route.segments;
    let title = TITLES[route.path] || "Page not found";
    if (seg[0] === "services" && seg[1]) {
      const svc = data.services.find((s) => s.slug === seg[1]);
      if (svc) title = locale === "am" && svc.titleAm ? svc.titleAm : svc.titleEn;
    }
    if (seg[0] === "blog" && seg[1]) {
      const post = data.posts.find((p) => p.slug === seg[1]);
      if (post) title = post.title;
    }
    document.title = title === TITLES["/"] ? title : `${title} · Universe Medical Center`;
  }, [route, locale, data]);

  const navigate = useCallback((path: string) => {
    const target = path.startsWith("/") ? path : `/${path}`;
    if (`#${target}` === window.location.hash) {
      // same route — scroll top
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0 });
      return;
    }
    window.location.hash = `#${target}`;
  }, []);

  const scrollToId = useCallback((id: string) => {
    requestAnimationFrame(() => {
      lenisRef.current?.scrollTo(`#${id}`, { offset: -90, duration: 1.4 });
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("umc-locale", l);
  }, []);

  // scroll to top on route change + refresh ScrollTrigger
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0 });
    // refresh GSAP after new page mounts
    const id = window.setTimeout(() => {
       
      (window as any).ScrollTrigger?.refresh();
    }, 350);
    return () => window.clearTimeout(id);
  }, [route.path]);

  const value = useMemo<SiteCtxValue>(() => {
    return {
      data,
      settings: data.settings,
      locale,
      setLocale,
      route,
      navigate,
      scrollToId,
      t: (key: string) => translate(key, locale),
      L: (en: string, am: string) => (locale === "am" && am ? am : en),
      section: (page: string, key: string) => mergeSection(page, key, locale, data.content),
      visible: (page: string, key: string) => data.sectionsIndex[`${page}.${key}`]?.visible !== false,
    };
  }, [data, locale, route, setLocale, navigate, scrollToId]);

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

/** Anchor link for the virtual router. */
export function A({
  href,
  children,
  className,
  onClick,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const { navigate } = useSite();
  const isPlainHash = href.startsWith("#");
  return (
    <a
      href={isPlainHash ? href : `#${href}`}
      className={className}
      aria-label={ariaLabel}
      data-cursor="link"
      onClick={(e) => {
        onClick?.();
        if (isPlainHash) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
