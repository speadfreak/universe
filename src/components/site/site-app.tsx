"use client";

import React, { Suspense, lazy, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteProvider, useSite } from "./site-context";
import { SmoothScroll } from "./smooth-scroll";
import { Cursor } from "./cursor";
import { Preloader } from "./preloader";
import { Header } from "./header";
import { Footer } from "./footer";
import { FloatingControls } from "./floating-controls";
import HomePage from "@/features/pages/home";
import AboutPage from "@/features/pages/about";
import ServicesPage from "@/features/pages/services";
import ServiceDetailPage from "@/features/pages/service-detail";
import DoctorsPage from "@/features/pages/doctors";
import PackagesPage from "@/features/pages/packages";
import BlogPage from "@/features/pages/blog";
import BlogPostPage from "@/features/pages/blog-post";
import ContactPage from "@/features/pages/contact";
import BookPage from "@/features/pages/book";
import ResourcesPage from "@/features/pages/resources";
import LegalPage from "@/features/pages/legal";
import { NotFoundPage } from "@/features/pages/not-found";
import { ButtonRed } from "./bits";
import type { SiteData } from "@/lib/site-types";

const AdminApp = lazy(() => import("@/components/admin/admin-app"));

function RouterOutlet() {
  const { route } = useSite();
  const seg = route.segments;

  if (seg[0] === "about") return <AboutPage />;
  if (seg[0] === "services" && seg[1]) return <ServiceDetailPage slug={seg[1]} />;
  if (seg[0] === "services") return <ServicesPage />;
  if (seg[0] === "doctors") return <DoctorsPage />;
  if (seg[0] === "packages") return <PackagesPage />;
  if (seg[0] === "blog" && seg[1]) return <BlogPostPage slug={seg[1]} />;
  if (seg[0] === "blog") return <BlogPage />;
  if (seg[0] === "contact") return <ContactPage />;
  if (seg[0] === "book") return <BookPage />;
  if (seg[0] === "resources") return <ResourcesPage />;
  if (seg[0] === "privacy") return <LegalPage doc="privacy" />;
  if (seg[0] === "terms") return <LegalPage doc="terms" />;
  return <HomePage />;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackRender: () => React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallbackRender: () => React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallbackRender();
    return this.props.children;
  }
}

function BrandedError() {
  const { section } = useSite();
  const err = section("error", "serverError");
  return (
    <section className="flex min-h-screen items-center justify-center bg-mesh-dark grain pt-20">
      <div className="container-x max-w-md text-center">
        <p className="font-display text-7xl font-bold text-gradient" aria-hidden="true">!</p>
        <h1 className="h2 mt-4 text-ice">{err.title as string}</h1>
        <p className="mt-3 text-sm text-ice-dim">{err.text as string}</p>
        <div className="mt-7 flex justify-center">
          <ButtonRed onClick={() => (window.location.hash = "#/")}>{err.cta as string}</ButtonRed>
        </div>
      </div>
    </section>
  );
}

function PageShell() {
  const { route, section } = useSite();
  const nf = section("error", "notfound");
  const known = [
    "about", "services", "doctors", "packages", "blog", "contact", "book", "resources", "privacy", "terms",
  ].includes(route.segments[0] || "") || route.segments.length === 0;

  if (!known) {
    return (
      <motion.div
        key="404"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NotFoundPage />
        {/* keep TS import used */}
        <span className="sr-only">{nf.title as string}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={route.path}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <RouterOutlet />
    </motion.div>
  );
}

function PublicChrome() {
  const { route } = useSite();
  return (
    <>
      <Header />
      <ErrorBoundary fallbackRender={() => <BrandedError />}>
        <main id="main-content" className="flex min-h-[60vh] flex-col">
          <AnimatePresence mode="wait">
            <PageShell />
          </AnimatePresence>
        </main>
      </ErrorBoundary>
      <Footer />
      <FloatingControls />
      {/* Admin route is independent of site chrome — see SiteApp */}
      <span className="hidden">{route.path}</span>
    </>
  );
}

export function SiteApp({ data }: { data: SiteData }) {
  // The admin route is resolved after mount (the server never sees the URL
  // hash), so the first client render matches SSR and hydration never tears.
  const [admin, setAdmin] = useState(false);

  useLayoutEffect(() => {
    const onHash = () => setAdmin(window.location.hash.startsWith("#/admin"));
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <SiteProvider data={data}>
      <SmoothScroll />
      <Cursor />
      {!admin && (
        <>
          <Preloader enabled={data.settings.preloaderEnabled} logoUrl={data.settings.logoUrl} />
          <PublicChrome />
        </>
      )}
      {admin && (
        <ErrorBoundary fallbackRender={() => <BrandedError />}>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-ink">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" aria-label="Loading admin" />
              </div>
            }
          >
            <AdminApp />
          </Suspense>
        </ErrorBoundary>
      )}
    </SiteProvider>
  );
}
