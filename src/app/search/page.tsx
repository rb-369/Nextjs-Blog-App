import Link from "next/link";
import { auth } from "@/lib/auth";
import ViewTrackedLink from "@/components/post/view-tracked-link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Filter, SearchIcon, Sparkles, UserRound } from "lucide-react";
import { searchPostsAdvanced } from "@/lib/db/queries";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | VELO",
  description: "Search VELO for engineering posts, topics, and creators.",
};

const QUICK_TAGS = [
  "nextjs",
  "drizzle",
  "postgres",
  "authentication",
  "performance",
  "tailwind",
  "architecture",
];

function getReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    author?: string;
    sort?: "newest" | "trending";
    minRead?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const tag = (params.tag ?? "").trim();
  const author = (params.author ?? "").trim();
  const sort = params.sort === "trending" ? "trending" : "newest";
  const minRead = Number(params.minRead ?? "0") || 0;
  const from = (params.from ?? "").trim();
  const to = (params.to ?? "").trim();
  const session = await auth.api.getSession({ headers: await headers() });

  const filteredPosts = await searchPostsAdvanced(
    {
      query,
      tag,
      author,
      sort,
      minReadMinutes: minRead || undefined,
      dateFrom: from ? new Date(from) : undefined,
      dateTo: to ? new Date(to) : undefined,
    },
    session?.user?.id
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-8">
      {/* Search Header Container */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 shadow-xs backdrop-blur-md">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Knowledge Discovery</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
          Search the VELO Archive
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Find implementation guides, architectural breakdowns, and field notes by topic, tag, or author.
        </p>

        {/* Search & Filter Form */}
        <form action="/search" method="get" className="mt-6 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                type="text"
                placeholder="Search articles by title, keywords, or concept..."
                className="h-12 pl-10 rounded-xl bg-background border-border"
                defaultValue={query}
              />
            </div>
            <Button type="submit" className="h-12 px-6 rounded-xl font-semibold cursor-pointer shrink-0">
              Search
            </Button>
          </div>

          {/* Filter Bar Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </span>

            <Input
              name="tag"
              placeholder="Tag (e.g. nextjs)"
              className="h-9 w-32 rounded-lg bg-background text-xs"
              defaultValue={tag}
            />

            <Input
              name="author"
              placeholder="Author name"
              className="h-9 w-32 rounded-lg bg-background text-xs"
              defaultValue={author}
            />

            <select
              name="sort"
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              defaultValue={sort}
            >
              <option value="newest">Sort: Newest</option>
              <option value="trending">Sort: Trending</option>
            </select>

            <Input
              name="minRead"
              type="number"
              min={0}
              placeholder="Min mins"
              className="h-9 w-24 rounded-lg bg-background text-xs"
              defaultValue={minRead || ""}
            />
          </div>
        </form>

        {/* Quick Tag Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground pr-1">Popular:</span>
          {QUICK_TAGS.map((t) => (
            <Link
              key={t}
              href={`/search?tag=${encodeURIComponent(t)}`}
              className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              #{t}
            </Link>
          ))}
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {query
            ? `Found ${filteredPosts.length} result(s) for "${query}"`
            : `Showing all posts (${filteredPosts.length})`}
        </p>
        {(query || tag || author) && (
          <Link href="/search" className="text-xs font-semibold text-primary hover:underline">
            Clear all filters
          </Link>
        )}
      </div>

      {/* Results List */}
      <section className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
            <h3 className="text-lg font-bold text-foreground">No matching stories found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try searching with broader terms or click one of the popular tags above to explore related work.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Reset search
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <ViewTrackedLink
              key={post.id}
              postId={post.id}
              href={`/post/${post.slug}`}
              className="group block rounded-2xl border border-border/70 bg-card/75 p-6 transition-all duration-200 hover:border-foreground/25 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" />
                  {post.author?.name ?? "Anonymous"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getReadTime(post.content)}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground transition group-hover:text-primary">
                {post.title}
              </h2>

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {post.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-xs text-muted-foreground font-mono">
                  {post.category || "General"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition group-hover:translate-x-0.5">
                  Read article
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </ViewTrackedLink>
          ))
        )}
      </section>
    </main>
  );
}

export default SearchPage;