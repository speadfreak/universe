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
      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x max-w-3xl">
          <Reveal className="glass border-glow rounded-3xl p-8 sm:p-10 md-content">
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-ice-dim">…</p>}
          </Reveal>
        </div>
      </section>
    </>
  );
}
