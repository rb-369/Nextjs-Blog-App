import PostCard from "@/components/post/post-card";
import { getPostsByTag } from "@/lib/db/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  return {
    title: `#${decodedName}`,
    description: `Browse posts tagged #${decodedName} on VELO.`,
  };
}

async function TagPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const { tag, posts } = await getPostsByTag(name);

  if (!tag) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Explore</span>
      </Link>

      {/* Tag Discovery Header */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span>Topic Archive</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              #{tag.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Curated articles, guides, and discussions classified under this topic.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground self-start md:self-auto">
            <span className="font-bold text-foreground">{posts.length}</span>{" "}
            <span>article{posts.length === 1 ? "" : "s"} indexed</span>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      {posts.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
          <p className="text-base font-semibold text-foreground">No articles tagged #{tag.name} yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Be the first to publish a post under this topic.</p>
          <Link
            href="/post/create"
            className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Create post
          </Link>
        </div>
      )}
    </main>
  );
}

export default TagPage;
