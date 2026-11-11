"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays, Check, Clock, Link2, List } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonGhost, JsonLd } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { PostCard } from "@/components/site/cards";
import { toast } from "sonner";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function BlogPostPage({ slug }: { slug: string }) {
  const { data, navigate, L } = useSite();
  const post = data.posts.find((p) => p.slug === slug);
  const [copied, setCopied] = useState(false);

  const headings = useMemo(() => {
    if (!post) return [];
    return post.content
      .split("\n")
      .filter((line) => line.startsWith("## "))
      .map((line) => ({ text: line.replace(/^##\s+/, ""), id: slugify(line.replace(/^##\s+/, "")) }));
  }, [post]);

  const related = useMemo(
    () => data.posts.filter((p) => p.id !== post?.id && p.category === post?.category).slice(0, 3),
    [data.posts, post]
  );

  useEffect(() => {
    if (!post) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      author: { "@type": "Organization", name: "Universe Medical Center" },
      publisher: { "@type": "Organization", name: "Universe Medical Center" },
      mainEntityOfPage: `${window.location.origin}/#/blog/${post.slug}`,
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "blog-posting-jsonld";
    el.text = JSON.stringify(schema);
    document.head.appendChild(el);
    return () => {
      document.getElementById("blog-posting-jsonld")?.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <section className="bg-ink-vignette grain on-dark flex min-h-[70vh] items-center pt-24">
        <div className="container-x text-center">
          <h1 className="h1 text-porcelain">Article not found</h1>
          <ButtonGhost className="mt-8" onDark onClick={() => navigate("/blog")}>
            <ArrowLeft className="h-4 w-4" /> All articles
          </ButtonGhost>
        </div>
      </section>
    );
  }

  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${post.title} — Universe Medical Center`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(L("Link copied", "አገናኝ ተቀድቷል"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <article>
        {/* editorial ink header */}
        <header className="bg-ink-vignette grain on-dark relative overflow-hidden">
          <div className="container-x relative pb-16 pt-32 sm:pb-20 sm:pt-40">
            <Reveal>
              <button
                onClick={() => navigate("/blog")}
                className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-porcelain/60 transition hover:text-porcelain"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {L("All articles", "ሁሉም መጣጥፎች")}
              </button>
            </Reveal>

            <div className="mx-auto max-w-3xl">
              <Reveal>
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-porcelain/55">
                  <span className="text-porcelain">{post.category}</span>
                  <span className="h-1 w-1 rounded-full bg-crimson" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    <time dateTime={post.publishedAt}>{dateStr}</time>
                  </span>
                  <span className="h-1 w-1 rounded-full bg-crimson" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.readingTime} min {L("read", "ንባብ")}
                  </span>
                </div>
              </Reveal>

              <h1 className="h-display mt-6 text-porcelain">
                <Reveal>{post.title}</Reveal>
              </h1>

              <Reveal delay={0.1}>
                <p className="lead lead-on-dark mt-6 max-w-2xl">{post.excerpt}</p>
              </Reveal>

              {post.coverImage && (
                <Reveal delay={0.14} className="mt-10">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] border border-porcelain/12">
                    <Image src={post.coverImage} alt={post.title} fill sizes="(max-width:768px) 100vw, 768px" priority className="object-cover" />
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </header>

        {/* porcelain reading body */}
        <div className="bg-porcelain-flat pb-16">
          <div className="container-x">
            <div className="mx-auto max-w-3xl">
              {/* share */}
              <Reveal delay={0.16}>
                <div className="mt-8 flex flex-wrap items-center gap-2.5 border-y border-ink/12 py-4">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-stone-deep">{L("Share", "አጋሩ")}</span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[10px] border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-crimson hover:text-crimson"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[10px] border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-crimson hover:text-crimson"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[10px] border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-crimson hover:text-crimson"
                  >
                    X
                  </a>
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-crimson hover:text-crimson"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-crimson" /> : <Link2 className="h-3.5 w-3.5" />}
                    {copied ? L("Copied", "ተቀድቷል") : L("Copy link", "አገናኝ ቅዳ")}
                  </button>
                </div>
              </Reveal>

              {/* TOC */}
              {headings.length > 1 && (
                <Reveal delay={0.18}>
                  <nav className="mt-8 rounded-[10px] border border-ink/12 bg-bone/50 p-6" aria-label="Table of contents">
                    <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-crimson-deep">
                      <List className="h-3.5 w-3.5" aria-hidden="true" />
                      {L("In this article", "በዚህ ጽሑፍ ውስጥ")}
                    </p>
                    <ol className="space-y-2 text-sm">
                      {headings.map((h, i) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className="text-stone-deep transition hover:text-crimson"
                          >
                            {i + 1}. {h.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </Reveal>
              )}

              {/* body */}
              <Reveal delay={0.12} className="md-content mt-10">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => {
                      const text = Array.isArray(children) ? children.join("") : String(children ?? "");
                      return <h2 id={slugify(text)}>{children}</h2>;
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </Reveal>
            </div>
          </div>
        </div>
      </article>

      {/* related */}
      {related.length > 0 && (
        <section className="section-pad bg-porcelain-deep">
          <div className="container-x">
            <div className="rule mb-10" aria-hidden="true" />
            <h2 className="h2 text-ink">{L("Keep reading", "ማንበብዎን ይቀጥሉ")}</h2>
            <StaggerGroup className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <StaggerItem key={p.id} className="h-full">
                  <PostCard post={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}
    </>
  );
}
