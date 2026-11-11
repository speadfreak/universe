"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSite } from "@/components/site/site-context";
import { PageHero } from "@/components/site/bits";
import { Reveal } from "@/components/site/motion";

/** Renders the legal markdown documents shipped in /public/legal (admin-replaceable). */
export default function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const { L } = useSite();
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const file = doc === "privacy" ? "/legal/privacy-policy.md" : "/legal/terms-of-service.md";
    fetch(file)
      .then((r) => (r.ok ? r.text() : ""))
      .then(setContent)
      .catch(() => setContent(""));
  }, [doc]);

  return (
    <>
      <PageHero
        title={doc === "privacy" ? L("Privacy Policy", "የግላዊነት ፖሊሲ") : L("Terms of Service", "የአገልግሎት ውሎች")}
        crumb={doc === "privacy" ? L("Privacy", "ግላዊነት") : L("Terms", "ውሎች")}
      />
      <section className="section-pad bg-porcelain-flat">
        <div className="container-x max-w-3xl">
          <div className="rule" aria-hidden="true" />
          <Reveal className="md-content mt-10">
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-stone-deep">…</p>}
          </Reveal>
        </div>
      </section>
    </>
  );
}
