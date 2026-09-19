import PostContent from "@/components/post/post-content";
import PostViewTracker from "@/components/post/post-view-tracker";
import { auth } from "@/lib/auth";
import {
  getPostBySlug,
  getPostCommentsWithReplies,
  getPostEngagementCounts,
  getUserPostEngagementState,
} from "@/lib/db/queries";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The post you are looking for could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.description || "Read this post on VELO.",
    openGraph: {
      title: `${post.title} | VELO`,
      description: post.description || "Read this post on VELO.",
      images: post.coverImage ? [post.coverImage] : ["/velo_hero_art.jpg"],
    },
  };
}

async function PostDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!post) {
    notFound();
  }

  const isAuthor = session?.user?.id === post.authorId;

  const [engagement, userState, comments] = await Promise.all([
    getPostEngagementCounts(post.id),
    getUserPostEngagementState(post.id, session?.user?.id),
    getPostCommentsWithReplies(post.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-6">
      {/* Back to feed */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Explore</span>
      </Link>

      <PostViewTracker postId={post.id} />
      <PostContent
        post={post}
        isAuthor={isAuthor}
        engagement={engagement}
        userState={userState}
        comments={comments}
      />
    </main>
  );
}

export default PostDetailsPage;