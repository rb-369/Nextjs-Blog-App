import { PostContentProps } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { estimateReadTime, formatDate, slugify } from "@/lib/utils"
import { Button } from "../ui/button"
import Link from "next/link"
import { CalendarDays, Pencil, UserRound } from "lucide-react"
import DeletePostButton from "./delete-post-button"
import PostInteractions from "./post-interactions"
import PostComments from "./post-comments"



function PostContent({ post, isAuthor, engagement, userState, comments }: PostContentProps) {

    return (
        <Card className="overflow-hidden border-border/70 bg-card/80">
            {post.coverImage ? (
                <div className="h-56 w-full overflow-hidden md:h-80">
                    <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
                </div>
            ) : null}
            <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="rounded-full border px-2.5 py-1">{post.category}</span>
                    <span className="rounded-full border px-2.5 py-1">{estimateReadTime(post.content)}</span>
                    {!post.published ? <span className="rounded-full border px-2.5 py-1">Draft</span> : null}
                    {(post.postTags ?? []).map((item) => (
                        <Link key={item.tag.id} href={`/tag/${item.tag.slug}`} className="rounded-full border px-2.5 py-1 hover:bg-muted">
                            #{item.tag.name}
                        </Link>
                    ))}
                </div>
                <CardTitle className="text-3xl leading-tight md:text-4xl">
                    {post.title}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-4 w-4" />
                        {post.author.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(post.createdAt)}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">{post.description}</p>
                <article className="prose prose-zinc max-w-none whitespace-pre-wrap text-base leading-8 dark:prose-invert">
                    {post.content}
                </article>

                <PostInteractions
                    postId={post.id}
                    authorId={post.authorId}
                    authorName={post.author.name}
                    slug={post.slug}
                    engagement={engagement}
                    userState={userState}
                />

                <PostComments
                    postId={post.id}
                    comments={comments}
                    isAuthor={isAuthor}
                />
            </CardContent>
            {
                isAuthor && (
                    <CardFooter>
                        
                        <div className="flex gap-2 mr-3">
                            <Button asChild variant={"outline"} size={"sm"}>
                                <Link href={`/post/edit/${slugify(post.title)}`}>
                                    <Pencil className="h-4 w-4 mr-0.5"/>Edit
                                </Link>
                            </Button>

                        </div>
                        <DeletePostButton postId={post.id}/>
                    </CardFooter>
                )
            }
        </Card>
    )
}

export default PostContent