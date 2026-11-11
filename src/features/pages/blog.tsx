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

      <section className="section-pad bg-porcelain-flat">
        <div className="container-x">
          {/* search + filters */}
          <Reveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="no-scrollbar flex gap-8 overflow-x-auto border-b border-ink/12">
              <FilterLink active={category === "all"} onClick={() => { setCategory("all"); setPage(1); }}>
                {L("All posts", "ሁሉም")}
              </FilterLink>
              {categories.map((c) => (
                <FilterLink key={c} active={category === c} onClick={() => { setCategory(c); setPage(1); }}>
                  {c}
                </FilterLink>
              ))}
            </div>
            <label className="flex w-full shrink-0 items-center gap-2.5 border-b border-ink/12 pb-3 transition-colors focus-within:border-crimson lg:w-72">
              <Search className="h-4 w-4 shrink-0 text-stone-deep" aria-hidden="true" />
              <span className="sr-only">{L("Search articles", "መጣጥፎችን ይፈልጉ")}</span>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder={L("Search articles…", "መጣጥፎችን ይፈልጉ…")}
                className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-stone-deep/70 focus:outline-none"
              />
            </label>
          </Reveal>

          {featured && (
            <Reveal className="mb-14">
              <p className="eyebrow mb-5 text-crimson-deep">{L("Editor's pick", "የአርታኢ ምርጫ")}</p>
              <PostCard post={featured} featured />
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
            <p className="mt-16 text-center text-sm text-stone-deep">{L("No articles match your search.", "ከፍለጋዎ ጋር የሚስማማ መጣጥፍ አልተገኘም።")}</p>
          )}

          {/* pagination */}
          {pages > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "num-serif h-10 w-10 rounded-full border text-sm transition",
                    page === i + 1 ? "border-crimson bg-crimson text-white" : "border-ink/15 text-stone-deep hover:border-ink/40 hover:text-ink"
                  )}
                  aria-current={page === i + 1 ? "page" : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson disabled:opacity-30"
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

function FilterLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative shrink-0 pb-3 text-sm font-semibold transition-colors duration-300",
        active ? "text-ink" : "text-stone-deep hover:text-ink"
      )}
      aria-pressed={active}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300 ease-out",
          active ? "scale-x-100 bg-crimson" : "scale-x-0 bg-ink/25 group-hover:scale-x-100"
        )}
        aria-hidden="true"
      />
    </button>
  );
}
