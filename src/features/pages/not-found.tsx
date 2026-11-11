"use client";

import React, { useEffect } from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonGhost, ButtonRed, EcgDivider } from "@/components/site/bits";
import { motion } from "framer-motion";
import { str } from "@/lib/content-schema";

export function NotFoundPage() {
  const { section, t, L } = useSite();
  const nf = section("error", "notfound");

  useEffect(() => {
    document.title = "404 · Universe Medical Center";
  }, []);

  return (
    <section className="bg-ink-vignette grain on-dark relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="container-x relative max-w-lg text-center">
        <motion.p
          className="num-serif text-[clamp(5rem,18vw,9rem)] leading-none text-crimson"
          initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          404
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}>
          <p className="eyebrow mt-2 text-porcelain/55">
            <HeartPulse className="mr-2 inline h-4 w-4 text-crimson" aria-hidden="true" />
            Universe Medical Center
          </p>
          <h1 className="h2 mt-4 text-porcelain">{str(nf, "title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-porcelain/70">{str(nf, "text")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonRed onClick={() => (window.location.hash = "#/")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {str(nf, "cta") || t("common.backHome")}
            </ButtonRed>
            <ButtonGhost onDark onClick={() => (window.location.hash = "#/contact")}>
              {L("Contact", "አግኙን")}
            </ButtonGhost>
          </div>
        </motion.div>
        <div className="mt-12 text-crimson/40">
          <EcgDivider />
        </div>
      </div>
    </section>
  );
}
