import { PostCardProps } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"
import { estimateReadTime, formatDate } from "@/lib/utils"
import { ArrowUpRight, CalendarDays } from "lucide-react"


function PostCard({post}: PostCardProps) {
 
  return (
  <Card className="group h-full overflow-hidden border-border/70 bg-card/70 transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg">
    {post.coverImage ? (
      <div className="h-40 w-full overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
    ) : (
      <div className="h-40 w-full bg-[linear-gradient(135deg,rgba(2,132,199,0.15),rgba(16,185,129,0.1),rgba(249,115,22,0.12))]" />
    )}
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="rounded-full border border-border/80 bg-background/70 px-2.5 py-1 font-semibold text-muted-foreground">
          {post.category}
        </span>
        <span className="text-muted-foreground">{estimateReadTime(post.content)}</span>
      </div>
      <Link className="inline-block" href={`/post/${post.slug}`}>
      <CardTitle className="text-2xl leading-tight transition group-hover:text-primary">{post.title}</CardTitle>
      </Link>
      <CardDescription className="flex items-center gap-1.5 text-xs md:text-sm">
        <CalendarDays className="h-3.5 w-3.5" />
        By {post.author.name} · {formatDate(post.createdAt)}
      </CardDescription>
        </CardHeader>
    <CardContent className="mt-auto">
      <p className="mb-4 text-muted-foreground">{post.description}</p>
      <Link href={`/post/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Read post
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
        </CardContent>
            
    </Card>
  )
}

export default PostCard