import PostCard from "@/components/post/post-card";
import { auth } from "@/lib/auth";
import { getYourPosts } from "@/lib/db/queries";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, PenSquare, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Your Posts | VELO",
  description: "Manage and review all posts authored by you on VELO.",
};

async function YourPosts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth");
  }

  const yourPosts = await getYourPosts(session.user.id);
  const postCount = yourPosts?.length ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-8">
      {/* Workspace Header */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Creator Library</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Your Published Articles
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your published guides, edit existing drafts, and monitor story reach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analytics"
              className="rounded-xl border border-border/80 bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              View Analytics
            </Link>
            <Link
              href="/post/create"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <PenSquare className="h-4 w-4" />
              <span>Create New</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{postCount}</span>
          <span>total articles authored</span>
        </div>
      </section>

      {/* Posts Grid or Clean Empty State */}
      {postCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No articles published yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Share your projects, tutorials, or architecture lessons with builders on VELO.
          </p>
          <Link
            href="/post/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            <PenSquare className="h-4 w-4" />
            <span>Write your first post</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {yourPosts?.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      )}
    </main>
  );
}

export default YourPosts;