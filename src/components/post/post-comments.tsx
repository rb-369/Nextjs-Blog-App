"use client";

import { addComment, deleteComment } from "@/actions/social-actions";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface CommentItem {
    id: number;
    postId: number;
    userId: string;
    parentId: number | null;
    content: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string;
    } | null;
    replies: Array<{
        id: number;
        postId: number;
        userId: string;
        parentId: number | null;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            name: string;
        } | null;
    }>;
}

interface PostCommentsProps {
    postId: number;
    comments: CommentItem[];
    isAuthor: boolean;
}

function PostComments({ postId, comments, isAuthor }: PostCommentsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [commentText, setCommentText] = useState("");
    const [replyMap, setReplyMap] = useState<Record<number, string>>({});

    const submitComment = (content: string, parentId?: number) => {
        startTransition(async () => {
            const result = await addComment(postId, content, parentId);

            if (!result.success) {
                toast(result.message || "Failed to submit comment");
                return;
            }

            toast(result.message || "Comment submitted");
            setCommentText("");
            if (parentId) {
                setReplyMap((prev) => ({ ...prev, [parentId]: "" }));
            }
            router.refresh();
        });
    };

    const handleDeleteComment = (commentId: number) => {
        startTransition(async () => {
            const result = await deleteComment(commentId);
            if (!result.success) {
                toast(result.message || "Failed to remove comment");
                return;
            }

            toast(result.message || "Comment removed");
            router.refresh();
        });
    };

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Comments</h3>

            <div className="space-y-2">
                <Textarea
                    placeholder="Add your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isPending}
                />
                <Button type="button" onClick={() => submitComment(commentText)} disabled={isPending || !commentText.trim()}>
                    Add Comment
                </Button>
            </div>

            <div className="space-y-4">
                {comments.length ? comments.map((comment) => (
                    <div key={comment.id} className="rounded-md border p-3">
                        <div className="mb-1 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">{comment.user?.name ?? "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                        </div>
                        <p className="text-sm">{comment.content}</p>

                        {isAuthor ? (
                            <div className="mt-2 flex gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteComment(comment.id)} disabled={isPending}>
                                    Remove Comment
                                </Button>
                            </div>
                        ) : null}

                        <div className="mt-3 space-y-2 rounded-md bg-muted/40 p-2">
                            {comment.replies.map((reply) => (
                                <div key={reply.id} className="rounded border bg-background p-2 text-sm">
                                    <p className="font-medium">{reply.user?.name ?? "Unknown User"}</p>
                                    <p>{reply.content}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                                    {isAuthor ? (
                                        <div className="mt-2 flex gap-2">
                                            <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteComment(reply.id)} disabled={isPending}>
                                                Remove Reply
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            <Textarea
                                placeholder="Reply to this comment"
                                value={replyMap[comment.id] ?? ""}
                                onChange={(e) => setReplyMap((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => submitComment(replyMap[comment.id] ?? "", comment.id)}
                                disabled={isPending || !(replyMap[comment.id] ?? "").trim()}
                            >
                                Reply
                            </Button>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}
            </div>
        </section>
    );
}

export default PostComments;
