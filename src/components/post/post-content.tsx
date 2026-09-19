import { PostContentProps } from "@/lib/types";
import { estimateReadTime, formatDate, slugify } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { CalendarDays, Clock, Pencil, Tag, UserRound } from "lucide-react";
import DeletePostButton from "./delete-post-button";
import PostInteractions from "./post-interactions";
import PostComments from "./post-comments";
import Image from "next/image";

export default function PostContent({
  post,
  isAuthor,
  engagement,
  userState,
  comments,
}: PostContentProps) {
  const readTime = estimateReadTime(post.content);

  return (
    <article className="rounded-3xl border border-border/70 bg-card/85 shadow-sm overflow-hidden backdrop-blur-md">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-50" />
        </div>
      )}

      <div className="p-6 md:p-10 space-y-8">
        {/* Topic & Read Time Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-foreground">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1">
            <Clock className="h-3 w-3" />
            {readTime}
          </span>
          {!post.published ? (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-400">
              Draft Mode
            </span>
          ) : null}

          {(post.postTags ?? []).map((item) => (
            <Link
              key={item.tag.id}
              href={`/tag/${item.tag.slug}`}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              <span>{item.tag.name}</span>
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-[1.2] text-balance">
          {post.title}
        </h1>

        {/* Author Bio Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border/60 py-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{post.author.name}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                <span>Published on {formatDate(post.createdAt)}</span>
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">
                <Link href={`/post/edit/${slugify(post.title)}`}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit Post
                </Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>

        {/* Lede Description */}
        {post.description && (
          <p className="text-lg md:text-xl font-normal leading-relaxed text-muted-foreground border-l-2 border-primary/50 pl-4">
            {post.description}
          </p>
        )}

        {/* Article Body Content */}
        <div className="prose prose-zinc max-w-none text-foreground/95 text-base md:text-lg leading-relaxed dark:prose-invert whitespace-pre-wrap font-sans">
          {post.content}
        </div>

        {/* Interactions Row (Clap/Likes, Comments, Bookmarks, Share) */}
        <div className="border-t border-border/60 pt-6">
          <PostInteractions
            postId={post.id}
            authorId={post.authorId}
            authorName={post.author.name}
            slug={post.slug}
            engagement={engagement}
            userState={userState}
          />
        </div>

        {/* Comments Section */}
        <div className="border-t border-border/60 pt-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
            Reader Discussion
          </h2>
          <PostComments
            postId={post.id}
            comments={comments}
            isAuthor={isAuthor}
          />
        </div>
      </div>
    </article>
  );
}