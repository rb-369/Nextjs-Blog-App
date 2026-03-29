"use client";

import {
    markPostAsNotInterested,
    recordPostShare,
    reportPost,
    toggleBookmark,
    toggleAuthorNotify,
    toggleAuthorSubscription,
    togglePostReaction,
} from "@/actions/social-actions";
import { PostEngagementCounts, PostUserEngagementState } from "@/lib/types";
import { Bell, Bookmark, Flag, MessageCircle, Share2, ThumbsDown, ThumbsUp, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface PostInteractionsProps {
    postId: number;
    authorId: string;
    authorName: string;
    slug: string;
    engagement: PostEngagementCounts;
    userState: PostUserEngagementState;
}

function PostInteractions({ postId, authorId, authorName, slug, engagement, userState }: PostInteractionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [reportReason, setReportReason] = useState("");

    const runAction = (action: () => Promise<{ success: boolean; message?: string }>, successMessage?: string) => {
        startTransition(async () => {
            const result = await action();
            if (!result.success) {
                toast(result.message || "Action failed");
                return;
            }

            if (successMessage) {
                toast(successMessage);
            }
            router.refresh();
        });
    };

    const handleShare = () => {
        startTransition(async () => {
            const postUrl = `${window.location.origin}/post/${slug}`;

            try {
                await navigator.clipboard.writeText(postUrl);
                await recordPostShare(postId, "copy_link");
                toast("Post link copied and share tracked");
            } catch {
                toast("Unable to copy link");
            }

            router.refresh();
        });
    };

    const handleReport = () => {
        const trimmed = reportReason.trim();
        if (!trimmed) {
            toast("Please provide a report reason");
            return;
        }

        runAction(() => reportPost(postId, trimmed), "Post reported. It will be hidden from your feed.");
        setReportReason("");
    };

    return (
        <section className="rounded-lg border p-4">
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Views</p>
                    <p className="text-lg font-semibold">{engagement.views}</p>
                </div>
                <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Comments</p>
                    <p className="text-lg font-semibold">{engagement.comments}</p>
                </div>
                <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Shares</p>
                    <p className="text-lg font-semibold">{engagement.shares}</p>
                </div>
                <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Subscribers</p>
                    <p className="text-lg font-semibold">{engagement.subscribers}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={userState.reactionType === "like" ? "default" : "outline"}
                    size="sm"
                    onClick={() => runAction(() => togglePostReaction(postId, "like"))}
                    disabled={isPending}
                >
                    <ThumbsUp className="mr-1.5 h-4 w-4" /> Like ({engagement.likes})
                </Button>

                <Button
                    type="button"
                    variant={userState.reactionType === "dislike" ? "default" : "outline"}
                    size="sm"
                    onClick={() => runAction(() => togglePostReaction(postId, "dislike"))}
                    disabled={isPending}
                >
                    <ThumbsDown className="mr-1.5 h-4 w-4" /> Dislike ({engagement.dislikes})
                </Button>

                <Button
                    type="button"
                    variant={userState.isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={() => runAction(() => toggleBookmark(postId), userState.isBookmarked ? "Removed bookmark" : "Saved to bookmarks")}
                    disabled={isPending}
                >
                    <Bookmark className="mr-1.5 h-4 w-4" /> {userState.isBookmarked ? "Saved" : "Save Post"}
                </Button>

                <Button
                    type="button"
                    variant={userState.isSubscribed ? "default" : "outline"}
                    size="sm"
                    onClick={() => runAction(() => toggleAuthorSubscription(authorId), userState.isSubscribed ? `Unsubscribed from ${authorName}` : `Subscribed to ${authorName}`)}
                    disabled={isPending}
                >
                    <UserPlus className="mr-1.5 h-4 w-4" /> {userState.isSubscribed ? "Subscribed" : `Subscribe ${authorName}`}
                </Button>

                <Button
                    type="button"
                    variant={userState.notifyOnAuthorPost ? "default" : "outline"}
                    size="sm"
                    onClick={() => runAction(() => toggleAuthorNotify(authorId), userState.notifyOnAuthorPost ? "Post notifications off" : "You will be notified on new posts")}
                    disabled={isPending || !userState.isSubscribed}
                >
                    <Bell className="mr-1.5 h-4 w-4" /> {userState.notifyOnAuthorPost ? "Notifications On" : "Notify on new posts"}
                </Button>

                <Button type="button" variant="outline" size="sm" onClick={handleShare} disabled={isPending}>
                    <Share2 className="mr-1.5 h-4 w-4" /> Share Post
                </Button>

                <Button
                    type="button"
                    variant={userState.isNotInterested ? "default" : "outline"}
                    size="sm"
                    onClick={() => runAction(() => markPostAsNotInterested(postId), "Got it. We will show less similar posts")}
                    disabled={isPending || userState.isNotInterested}
                >
                    <MessageCircle className="mr-1.5 h-4 w-4" /> Not Interested
                </Button>
            </div>

            <div className="mt-4 rounded-md border p-3">
                <p className="mb-2 text-sm font-medium">Report this post</p>
                <div className="flex flex-col gap-2 md:flex-row">
                    <Input
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Spam, harmful content, copyright issue..."
                        disabled={isPending}
                    />
                    <Button type="button" variant="outline" onClick={handleReport} disabled={isPending}>
                        <Flag className="mr-1.5 h-4 w-4" /> Report
                    </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Reports: {engagement.reports}</p>
            </div>
        </section>
    );
}

export default PostInteractions;
