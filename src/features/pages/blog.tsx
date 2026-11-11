"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { PageHero } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { PostCard } from "@/components/site/cards";
import { str } from "@/lib/content-schema";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

export default function BlogPage() {
  const { data, section, L } = useSite();
  const hero = section("blog", "hero");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => [...new Set(data.posts.map((p) => p.category))], [data.posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.posts.filter((p) => {
      const matchesCat = category === "all" || p.category === category;
      const matchesQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [data.posts, query, category]);

  const [featured, ...rest] = filtered;
  const pages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pageItems = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("Blog", "ብሎግ")} />

      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x">
          {/* search + filters */}
          <Reveal className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              <FilterPill active={category === "all"} onClick={() => { setCategory("all"); setPage(1); }}>
                {L("All posts", "ሁሉም")}
              </FilterPill>
              {categories.map((c) => (
                <FilterPill key={c} active={category === c} onClick={() => { setCategory(c); setPage(1); }}>
                  {c}
                </FilterPill>
              ))}
            </div>
            <label className="glass flex min-h-11 w-full items-center gap-2.5 rounded-full px-4 lg:w-72">
              <Search className="h-4 w-4 shrink-0 text-ice-dim" aria-hidden="true" />
              <span className="sr-only">{L("Search articles", "መጣጥፎችን ይፈልጉ")}</span>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder={L("Search articles…", "መጣጥፎችን ይፈልጉ…")}
                className="w-full bg-transparent py-2.5 text-sm text-ice placeholder:text-ice-dim/60 focus:outline-none"
              />
            </label>
          </Reveal>

          {featured && (
            <Reveal className="mb-8">
              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <PostCard post={featured} />
                <div className="glass border-glow hidden flex-col justify-center rounded-2xl p-8 lg:flex">
                  <p className="eyebrow text-cyan">{L("Editor's pick", "የአርታኢ ምርጫ")}</p>
                  <h2 className="h2 mt-3 text-ice">{featured.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ice-dim">{featured.excerpt}</p>
                </div>
              </div>
            </Reveal>
          )}

          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <StaggerItem key={p.id} className="h-full">
                <PostCard post={p} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          {filtered.length === 0 && (
            <p className="mt-16 text-center text-ice-dim">{L("No articles match your search.", "ከፍለጋዎ ጋር የሚስማማ መጣጥፍ አልተገኘም።")}</p>
          )}

          {/* pagination */}
          {pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-ice transition hover:border-cyan/40 hover:text-cyan disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "h-10 w-10 rounded-full border font-display text-sm font-bold transition",
                    page === i + 1 ? "border-cyan/60 bg-brand/20 text-cyan" : "border-white/12 text-ice-dim hover:text-ice"
                  )}
                  aria-current={page === i + 1 ? "page" : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-ice transition hover:border-cyan/40 hover:text-cyan disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
        active ? "border-cyan/50 bg-brand/15 text-cyan" : "border-white/10 bg-white/4 text-ice-dim hover:text-ice"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
