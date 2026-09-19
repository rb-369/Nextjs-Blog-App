import PostForm from "@/components/post/post-form";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PenSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Post",
  description: "Write and publish a new post to share your ideas on VELO.",
};

function CreatePostPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-6">
      {/* Back Link */}
      <Link
        href="/yourPosts"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Your Posts</span>
      </Link>

      {/* Editor Header */}
      <div className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <PenSquare className="h-3.5 w-3.5 text-primary" />
          <span>Publisher Canvas</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Write a New Article
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft your tutorial, architecture decision, or project note using markdown.
        </p>

        <div className="mt-8 border-t border-border/60 pt-6">
          <PostForm />
        </div>
      </div>
    </main>
  );
}

export default CreatePostPage;