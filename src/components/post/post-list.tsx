import { PostListProps } from "@/lib/types";
import PostCard from "./post-card";
import Link from "next/link";
import { PenSquare } from "lucide-react";

export default function PostList({ posts }: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-lg font-semibold">No stories published yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Be the first to share an architectural insight or tutorial with the community.
        </p>
        <Link
          href="/post/create"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <PenSquare className="h-4 w-4" />
          Write first post
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}