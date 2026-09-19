import { auth } from "@/lib/auth";
import PostList from "@/components/post/post-list";
import { getFollowedAuthorsFeed } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Following",
  description: "Catch up on the latest posts from creators you follow on VELO.",
};

async function FollowingFeedPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const feedPosts = await getFollowedAuthorsFeed(session.user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-8">
      {/* Feed Header */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Network Feed</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Following Feed
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Direct dispatches and new publications from engineers and creators you follow.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted self-start md:self-auto"
          >
            <Compass className="h-4 w-4" />
            <span>Discover creators</span>
          </Link>
        </div>
      </section>

      {/* Feed Content */}
      {feedPosts.length ? (
        <PostList posts={feedPosts} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Your feed is waiting</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Follow authors whose work you enjoy to receive their latest tutorials and articles right here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Compass className="h-4 w-4" />
            <span>Browse community posts</span>
          </Link>
        </div>
      )}
    </main>
  );
}

export default FollowingFeedPage;
