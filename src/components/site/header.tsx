"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
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

      {/* announcement bar */}
      {settings.announcementEnabled && (
        <div className="fixed inset-x-0 top-0 z-[120] bg-gradient-to-r from-brand via-[#B5121C] to-brand text-center">
          <p className="container-x truncate py-1.5 text-xs font-medium tracking-wide text-white">
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
        <div
          className={cn(
            "transition-all duration-500",
            scrolled ? "glass-strong border-b border-cyan/10 shadow-[0_10px_40px_-18px_rgba(17,16,18,0.9)]" : "bg-transparent"
          )}
        >
          <div className="container-x flex h-[72px] items-center justify-between gap-4">
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

            {/* desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {NAV.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "group relative rounded-full px-3.5 py-2 text-[0.83rem] font-medium tracking-wide transition-colors",
                    isActive(item.href) ? "text-cyan" : "text-ice/75 hover:text-ice"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {t(item.key)}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan to-transparent transition-opacity",
                      isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                    )}
                  />
                </button>
              ))}
            </nav>

            {/* right side */}
            <div className="flex items-center gap-2.5">
              {/* locale switch */}
              <div
                className="flex items-center rounded-full border border-white/12 bg-white/5 p-0.5 backdrop-blur"
                role="group"
                aria-label="Language"
              >
                {(["en", "am"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-bold transition-all",
                      locale === l ? "bg-brand text-white shadow-[0_0_14px_rgba(227,32,43,0.45)]" : "text-ice-dim hover:text-ice"
                    )}
                    aria-pressed={locale === l}
                  >
                    {l === "en" ? "EN" : "አማ"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate("/book")}
                className="hidden min-h-11 items-center gap-2 rounded-full bg-clinic-red px-5 py-2.5 font-display text-[0.83rem] font-semibold text-white shadow-[0_0_24px_rgba(227,32,43,0.4)] transition hover:scale-[1.04] hover:shadow-[0_0_34px_rgba(227,32,43,0.5)] md:inline-flex"
              >
                <Phone className="h3.5 w-3.5" aria-hidden="true" />
                {t("nav.book")}
              </button>

              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-ice backdrop-blur transition hover:border-cyan/40 hover:text-cyan lg:hidden"
                aria-label={open ? t("nav.close") : t("nav.menu")}
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* scroll progress */}
          <motion.div
            className="h-[2.5px] origin-left bg-gradient-to-r from-brand via-cyan to-clinic-red"
            style={{ scaleX: progress }}
            aria-hidden="true"
          />
        </div>
      </motion.header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[105] flex flex-col bg-ink/97 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, clipPath: "circle(0% at 92% 6%)" }}
            animate={{ opacity: 1, clipPath: "circle(140% at 92% 6%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full border border-crimson/10" />
              <div className="absolute -right-10 top-1/3 h-[26rem] w-[26rem] rounded-full border border-crimson/6" />
            </div>
            {/* my-auto wrapper — safe centering: centers when the menu fits,
                scrolls naturally when it overflows (justify-center + overflow
                clips the TOP items, which collided the Home link under the
                header and made it unclickable on small phones) */}
            <nav className="container-x relative flex flex-1 flex-col overflow-y-auto overscroll-contain py-24" aria-label="Mobile">
              <div className="my-auto flex flex-col gap-1">
                {[...NAV, { key: "nav.resources", href: "/resources" }].map((item, i) => (
                  <motion.button
                    key={item.href}
                    onClick={() => {
                      setOpen(false);
                      navigate(item.href);
                    }}
                    className={cn(
                      "group flex min-h-[3.6rem] w-full items-center justify-between border-b border-white/6 py-3 text-left",
                      isActive(item.href) ? "text-cyan" : "text-ice"
                    )}
                    initial={{ opacity: 0, x: -26 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.055, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="font-display text-[1.7rem] font-bold tracking-tight">{t(item.key)}</span>
                    <span className="text-xs tabular-nums text-ice-dim/50">0{i + 1}</span>
                  </motion.button>
                ))}
                <motion.div
                  className="mt-8 flex flex-col gap-4 pb-6"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                >
                  <button
                    onClick={() => navigate("/book")}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-clinic-red font-display font-semibold text-white glow-red"
                  >
                    {t("nav.book")}
                  </button>
                  <a
                    href={`tel:${settings.phoneIntl}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full glass font-medium text-ice"
                  >
                    <Phone className="h-4 w-4 text-cyan" /> {settings.phone}
                  </a>
                  <p className="mt-2 text-center text-xs text-ice-dim">{L("Addis Ababa & Ambo", "አዲስ አበባ እና አምቦ")} · {settings.email}</p>
                </motion.div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
