import NotFoundPage from "@/app/not-found";
import PostForm from "@/components/post/post-form";
import RevisionHistory from "@/components/post/revision-history";
import { auth } from "@/lib/auth";
import { getPostBySlug, getPostRevisionHistory } from "@/lib/db/queries";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Post",
  description: "Update your existing post and manage revision history on VELO.",
};

async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/");
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    NotFoundPage();
  }

  if (post?.authorId !== session.user.id) {
    redirect("/");
  }

  const revisions = await getPostRevisionHistory(post.id, session.user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-6">
      {/* Back to Post */}
      <Link
        href={`/post/${post.slug}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Article</span>
      </Link>

      {/* Editor Header */}
      <div className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md space-y-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Pencil className="h-3.5 w-3.5 text-primary" />
            <span>Editor Studio</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Update Article
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Make changes to content, update tags, or manage your revision snapshots.
          </p>
        </div>

        <div className="border-t border-border/60 pt-6">
          <PostForm
            isEditing={true}
            post={{
              id: post.id,
              title: post.title,
              description: post.description,
              category: post.category,
              tags: (post.postTags ?? []).map((item) => item.tag.name).join(", "),
              coverImage: post.coverImage,
              status: post.status,
              scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
              content: post.content,
              slug: post.slug,
            }}
          />
        </div>

        <div className="border-t border-border/60 pt-6">
          <RevisionHistory
            postId={post.id}
            revisions={revisions.map((item) => ({
              id: item.id,
              title: item.title,
              createdAt: item.createdAt,
            }))}
          />
        </div>
      </div>
    </main>
  );
}

export default EditPostPage;