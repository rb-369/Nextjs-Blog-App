import { PostCardProps } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import ViewTrackedLink from "./view-tracked-link";
import { estimateReadTime, formatDate } from "@/lib/utils";
import { ArrowUpRight, CalendarDays, Clock, UserRound } from "lucide-react";
import Image from "next/image";

export default function PostCard({ post }: PostCardProps) {
  const readTime = estimateReadTime(post.content);

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/75 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-xl">
      {/* Cover Image or Elegant Pattern Fallback */}
      <div className="relative h-48 w-full overflow-hidden bg-muted/40">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                VELO Article
              </span>
              <p className="line-clamp-2 text-sm font-medium text-zinc-300">
                {post.title}
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
      </div>

      <CardHeader className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {readTime}
          </span>
        </div>

        <ViewTrackedLink postId={post.id} className="inline-block" href={`/post/${post.slug}`}>
          <CardTitle className="text-xl font-bold leading-snug tracking-tight text-foreground transition group-hover:text-primary">
            {post.title}
          </CardTitle>
        </ViewTrackedLink>

        <CardDescription className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
            {post.author?.name || "Anonymous Author"}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            {formatDate(post.createdAt)}
          </span>
        </CardDescription>

        {(post.postTags ?? []).length ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.postTags?.slice(0, 3).map((item) => (
              <Link
                key={item.tag.id}
                href={`/tag/${item.tag.slug}`}
                className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                #{item.tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="mt-auto flex flex-col justify-between p-5 pt-0">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <ViewTrackedLink
            postId={post.id}
            href={`/post/${post.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition group-hover:underline"
          >
            Read story
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </ViewTrackedLink>
        </div>
      </CardContent>
    </Card>
  );
}