import { PostContentProps } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { formatDate, slugify } from "@/lib/utils"
import { Button } from "../ui/button"
import Link from "next/link"
import { Pencil } from "lucide-react"
import DeletePostButton from "./delete-post-button"



function PostContent({ post, isAuthor }: PostContentProps) {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl">
                    {post.title}
                </CardTitle>
                <CardDescription>
                    By {post.author.name} - {formatDate(post.createdAt)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-lg mb-6">{post.description}</p>
                <p className="font-bold text-4xl mb-6">{post.content}</p>
            </CardContent>
            {
                isAuthor && (
                    <CardFooter >
                        
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