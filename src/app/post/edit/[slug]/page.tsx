import NotFoundPage from "@/app/not-found";
import Container from "@/components/layout/container";
import PostForm from "@/components/post/post-form";
import RevisionHistory from "@/components/post/revision-history";
import { auth } from "@/lib/auth";
import { getPostBySlug, getPostRevisionHistory } from "@/lib/db/queries";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Post | VELO",
  description: "Update your existing post and manage revision history on VELO.",
};


async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {

  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    redirect("/")
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
    <Container>
      <h1 className="max-w-2xl font-bold text-4xl mt-10 mb-6">
        Edit Post
      </h1>
      <PostForm isEditing={true} post={{
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        tags: (post.postTags ?? []).map((item) => item.tag.name).join(", "),
        coverImage: post.coverImage,
        status: post.status,
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
        content: post.content,
        slug: post.slug
      }} />
      <RevisionHistory
        postId={post.id}
        revisions={revisions.map((item) => ({
          id: item.id,
          title: item.title,
          createdAt: item.createdAt,
        }))}
      />
    </Container>
  )
}

export default EditPostPage;