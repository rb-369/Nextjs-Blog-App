import Link from "next/link";
import { auth } from "@/lib/auth";
import ViewTrackedLink from "@/components/post/view-tracked-link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, SearchIcon, Sparkles } from "lucide-react";
import { getAllPosts } from "@/lib/db/queries";
import { headers } from "next/headers";

const quickTags = [
  "nextjs",
  "drizzle",
  "postgres",
  "authentication",
  "performance",
  "tailwind",
];

function getReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const normalizedQuery = query.toLowerCase();
  const session = await auth.api.getSession({ headers: await headers() });
  const allPosts = await getAllPosts(session?.user?.id);

  const filteredPosts = normalizedQuery
    ? allPosts.filter((post) => {
        const haystack = [post.title, post.description, post.content, post.author?.name ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : allPosts;

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl border bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3.5" />
            Search The Blog
          </div>

          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Find exactly what you want to read.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Search guides, tutorials, and implementation notes. Use a keyword, then narrow with quick topics.
          </p>

          <form action="/search" method="get" className="mt-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                type="text"
                placeholder="Search by title, topic, or keyword..."
                className="h-11 pl-9"
                defaultValue={query}
              />
            </div>
            <Button type="submit" className="h-11 px-6">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {query
              ? `Showing ${filteredPosts.length} result(s) for "${query}"`
              : `Showing all posts (${filteredPosts.length})`}
          </p>

          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <h2 className="text-xl font-semibold">No matching posts found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or remove filters.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <ViewTrackedLink
                key={post.id}
                postId={post.id}
                href={`/post/${post.slug}`}
                className="group block rounded-2xl border bg-card p-5 transition hover:border-foreground/20 hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {post.author?.name ?? "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">{getReadTime(post.content)}</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">{post.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                  See Post
                  <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </ViewTrackedLink>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default SearchPage;