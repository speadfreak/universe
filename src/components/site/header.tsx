"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import { useSite } from "./site-context";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "nav.home", href: "/" },
  { key: "nav.about", href: "/about" },
  { key: "nav.services", href: "/services" },
  { key: "nav.doctors", href: "/doctors" },
  { key: "nav.packages", href: "/packages" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.contact", href: "/contact" },
];

export function Header() {
  const { settings, locale, setLocale, route, navigate, t, L } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 28);
      const goingDown = y > lastY.current;
      if (y > 160 && goingDown) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [route.path]);

  const isActive = (href: string) =>
    href === "/" ? route.path === "/" : route.path.startsWith(href);

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("common.skipToContent")}
      </a>

      {/* announcement bar — quiet ink strip, one crimson mark */}
      {settings.announcementEnabled && (
        <div className="fixed inset-x-0 top-0 z-[120] bg-ink text-center">
          <p className="container-x flex items-center justify-center gap-2.5 truncate py-1.5 text-xs font-medium tracking-wide text-porcelain/85">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-crimson" aria-hidden="true" />
            {locale === "am" && settings.announcementAm ? settings.announcementAm : settings.announcementEn}
          </p>
        </div>
      )}

      <motion.header
        className={cn(
          "fixed inset-x-0 z-[110] transition-[transform] duration-500",
          settings.announcementEnabled ? "top-[30px]" : "top-0"
        )}
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* solid ink on scroll — flat surface, no blur */}
        <div
          className={cn(
            "transition-all duration-500",
            scrolled || open ? "border-b border-porcelain/10 bg-ink" : "border-b border-transparent bg-transparent"
          )}
        >
          <div className="container-x flex h-[74px] items-center justify-between gap-4">
            {/* logo */}
            <button
              onClick={() => navigate("/")}
              className="flex shrink-0 items-center gap-3"
              aria-label="Universe Medical Center — home"
            >
              <Image
                src={settings.logoUrl || "/logo.png"}
                alt="Universe Medical Center logo"
                width={148}
                height={48}
                priority
                className="h-10 w-auto object-contain md:h-11"
              />
            </button>

            {/* desktop nav — hairline crimson underline, no glow */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              {NAV.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "group relative py-2 text-[0.84rem] font-medium tracking-wide transition-colors",
                    isActive(item.href) ? "text-porcelain" : "text-porcelain/60 hover:text-porcelain"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {t(item.key)}
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-crimson transition-transform duration-300",
                      isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </nav>

            {/* right side */}
            <div className="flex items-center gap-3">
              {/* locale switch — plain text with sliding crimson underline */}
              <div className="relative flex items-center gap-4" role="group" aria-label="Language">
                {(["en", "am"] as const).map((l, i) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={cn(
                      "relative pb-0.5 text-[0.8rem] font-bold tracking-wide transition-colors",
                      locale === l ? "text-porcelain" : "text-porcelain/45 hover:text-porcelain/80"
                    )}
                    aria-pressed={locale === l}
                  >
                    {l === "en" ? "EN" : "አማ"}
                    <span
                      className={cn(
                        "absolute inset-x-0 -bottom-0.5 h-[2px] bg-crimson transition-all duration-300",
                        locale === l ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
                        i === 0 ? "origin-left" : "origin-right"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate("/book")}
                className="group hidden min-h-11 items-center gap-3 rounded-[10px] bg-crimson px-5 py-2.5 font-body text-[0.83rem] font-semibold text-white transition-colors hover:bg-crimson-deep md:inline-flex"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {t("nav.book")}
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/18 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </button>

              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-porcelain/20 text-porcelain transition hover:border-porcelain/50 lg:hidden"
                aria-label={open ? t("nav.close") : t("nav.menu")}
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* scroll progress — thin crimson hairline */}
          <motion.div
            className="h-[2px] origin-left bg-crimson/90"
            style={{ scaleX: progress }}
            aria-hidden="true"
          />
        </div>
      </motion.header>

      {/* mobile menu — full ink, serif items, hairlines */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[105] flex flex-col bg-ink lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="bg-ink-vignette absolute inset-0" aria-hidden="true" />
            <nav className="container-x relative flex flex-1 flex-col justify-center gap-0 overflow-y-auto py-24" aria-label="Mobile">
              {[...NAV, { key: "nav.resources", href: "/resources" }].map((item, i) => (
                <motion.button
                  key={item.href}
                  onClick={() => {
                    setOpen(false);
                    navigate(item.href);
                  }}
                  className={cn(
                    "group flex items-baseline justify-between border-b border-porcelain/10 py-4 text-left",
                    isActive(item.href) ? "text-porcelain" : "text-porcelain/75"
                  )}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="font-display text-[1.65rem] tracking-tight">
                    <span className="num-serif mr-4 text-[0.8rem] text-crimson" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    {t(item.key)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-crimson opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </motion.button>
              ))}
              <motion.div
                className="mt-9 flex flex-col gap-4"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <button
                  onClick={() => navigate("/book")}
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-[10px] bg-crimson font-body font-semibold text-white"
                >
                  {t("nav.book")}
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/18" aria-hidden="true">
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </button>
                <a
                  href={`tel:${settings.phoneIntl}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-porcelain/25 font-medium text-porcelain"
                >
                  <Phone className="h-4 w-4 text-crimson" /> {settings.phone}
                </a>
                <p className="mt-2 text-center text-xs text-porcelain/55">{L("Addis Ababa & Ambo", "አዲስ አበባ እና አምቦ")} · {settings.email}</p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
