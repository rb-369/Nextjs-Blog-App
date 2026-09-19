import PostCard from "@/components/post/post-card";
import { auth } from "@/lib/auth";
import { getSavedPosts } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Saved Posts | VELO",
  description: "Access your bookmarked VELO posts in one place.",
};

async function SavedPostsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const savedPosts = await getSavedPosts(session.user.id);
  const count = savedPosts.length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-8">
      {/* Header Banner */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span>Reading List</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Saved Bookmarks
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Articles and engineering guides you have saved for offline study or later reference.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border/70 rounded-xl bg-background px-3 py-1.5 self-start md:self-auto">
            <span className="font-semibold text-foreground">{count}</span>
            <span>saved items</span>
          </div>
        </div>
      </section>

      {/* Grid or Empty State */}
      {count ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Bookmark className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No bookmarked articles yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Whenever you find a great tutorial or architectural note, bookmark it to save it here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Compass className="h-4 w-4" />
            <span>Discover stories</span>
          </Link>
        </div>
      )}
    </main>
  );
}

export default SavedPostsPage;
