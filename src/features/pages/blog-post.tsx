"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays, Check, Clock, Link2, List } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonGlass, JsonLd } from "@/components/site/bits";
import { PageBackdrop } from "@/components/site/page-backdrop";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { PostCard } from "@/components/site/cards";
import { withImageFallback } from "@/lib/backdrops";
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
      <section className="flex min-h-[70vh] items-center bg-mesh-dark pt-24">
        <div className="container-x text-center">
          <h1 className="h1 text-ice">Article not found</h1>
          <ButtonGlass className="mt-8" onClick={() => navigate("/blog")}>
            <ArrowLeft className="h-4 w-4" /> All articles
          </ButtonGlass>
        </div>
      </section>
    );
  }

  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${post.title} — Universe Medical Center`);

  // Article hero backdrop — admin slot first, the post's own cover second.
  const postBackdrop = withImageFallback(
    data.backdrops?.["hero.post"],
    post.coverImage ? [{ url: post.coverImage, alt: post.title, focal: { x: 0.5, y: 0.45 } }] : [],
  );

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
      <PageBackdrop
        config={postBackdrop}
        slotKey="hero.post"
        as="article"
        edge="none"
        className="pb-10 pt-32 sm:pt-36"
        childClassName="container-x relative"
      >
          <Reveal>
            <button
              onClick={() => navigate("/blog")}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ice-dim transition hover:text-cyan"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {L("All articles", "ሁሉም መጣጥፎች")}
            </button>
          </Reveal>

          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ice-dim">
                <span className="rounded-full bg-brand/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white">{post.category}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h3.5 w-3.5" aria-hidden="true" />
                  <time dateTime={post.publishedAt}>{dateStr}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h3.5 w-3.5" aria-hidden="true" />
                  {post.readingTime} min {L("read", "ንባብ")}
                </span>
              </div>
            </Reveal>

            <h1 className="h-display mt-5 text-ice">
              <Reveal>{post.title}</Reveal>
            </h1>

            <Reveal delay={0.1}>
              <p className="lead mt-5">{post.excerpt}</p>
            </Reveal>

            {post.coverImage && (
              <Reveal delay={0.14} className="mt-9">
                <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/8">
                  <Image src={post.coverImage} alt={post.title} fill sizes="(max-width:768px) 100vw, 768px" priority className="object-cover" />
                </div>
              </Reveal>
            )}

            {/* share */}
            <Reveal delay={0.16}>
              <div className="mt-7 flex flex-wrap items-center gap-2.5 border-y border-white/8 py-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-ice-dim">{L("Share", "አጋሩ")}</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs font-semibold text-ice transition hover:border-cyan/40 hover:text-cyan"
                >
                  Facebook
                </a>
                <a
                  href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs font-semibold text-ice transition hover:border-cyan/40 hover:text-cyan"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs font-semibold text-ice transition hover:border-cyan/40 hover:text-cyan"
                >
                  X
                </a>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-1.5 text-xs font-semibold text-ice transition hover:border-cyan/40 hover:text-cyan"
                >
                  {copied ? <Check className="h3.5 w-3.5 text-cyan" /> : <Link2 className="h3.5 w-3.5" />}
                  {copied ? L("Copied", "ተቀድቷል") : L("Copy link", "አገናኝ ቅዳ")}
                </button>
              </div>
            </Reveal>

            {/* TOC */}
            {headings.length > 1 && (
              <Reveal delay={0.18}>
                <nav className="glass mt-8 rounded-2xl p-6" aria-label="Table of contents">
                  <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan">
                    <List className="h3.5 w-3.5" aria-hidden="true" />
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
                          className="text-ice-dim transition hover:text-cyan"
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
      </PageBackdrop>

      {/* related */}
      {related.length > 0 && (
        <section className="relative section-pad bg-navy/60">
          <div className="container-x">
            <h2 className="h2 text-ice">{L("Keep reading", "ማንበብዎን ይቀጥሉ")}</h2>
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
