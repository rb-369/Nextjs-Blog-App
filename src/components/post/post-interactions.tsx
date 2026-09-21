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
import { cn } from "@/lib/utils";
import { Bell, Bookmark, Flag, MessageCircle, Share2, ThumbsDown, ThumbsUp, UserPlus } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
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

function PostInteractions({
    postId,
    authorId,
    authorName,
    slug,
    engagement: initialEngagement,
    userState: initialUserState,
}: PostInteractionsProps) {
    const [isPending, startTransition] = useTransition();
    const [reportReason, setReportReason] = useState("");

    // Optimistic local state for instantaneous 0ms feedback
    const [engagement, setEngagement] = useState<PostEngagementCounts>(initialEngagement);
    const [userState, setUserState] = useState<PostUserEngagementState>(initialUserState);

    // Keep state in sync if server props revalidate externally
    useEffect(() => {
        setEngagement(initialEngagement);
    }, [initialEngagement]);

    useEffect(() => {
        setUserState(initialUserState);
    }, [initialUserState]);

    // Sequence counters to prevent race conditions on rapid clicks
    const reactionSeqRef = useRef(0);
    const bookmarkSeqRef = useRef(0);
    const subscribeSeqRef = useRef(0);

    // Instant (0ms) Reaction Handler (Like / Dislike)
    const handleReaction = async (targetType: "like" | "dislike") => {
        const prevReaction = userState.reactionType;
        const prevLikes = engagement.likes;
        const prevDislikes = engagement.dislikes;

        let nextReaction: "like" | "dislike" | null = null;
        let nextLikes = prevLikes;
        let nextDislikes = prevDislikes;

        if (prevReaction === targetType) {
            // Toggling off current reaction
            nextReaction = null;
            if (targetType === "like") {
                nextLikes = Math.max(0, prevLikes - 1);
            } else {
                nextDislikes = Math.max(0, prevDislikes - 1);
            }
        } else {
            // Toggling on target reaction
            nextReaction = targetType;
            if (targetType === "like") {
                nextLikes = prevLikes + 1;
                if (prevReaction === "dislike") {
                    nextDislikes = Math.max(0, prevDislikes - 1);
                }
            } else {
                nextDislikes = prevDislikes + 1;
                if (prevReaction === "like") {
                    nextLikes = Math.max(0, prevLikes - 1);
                }
            }
        }

        // Apply optimistic UI state immediately (0ms)
        setUserState((prev) => ({ ...prev, reactionType: nextReaction }));
        setEngagement((prev) => ({ ...prev, likes: nextLikes, dislikes: nextDislikes }));

        const seq = ++reactionSeqRef.current;

        // Persist to database in background
        try {
            const result = await togglePostReaction(postId, targetType, nextReaction);
            if (!result.success) {
                // Roll back only if no subsequent click occurred
                if (reactionSeqRef.current === seq) {
                    setUserState((prev) => ({ ...prev, reactionType: prevReaction }));
                    setEngagement((prev) => ({ ...prev, likes: prevLikes, dislikes: prevDislikes }));
                    toast(result.message || "Failed to update reaction");
                }
            }
        } catch {
            if (reactionSeqRef.current === seq) {
                setUserState((prev) => ({ ...prev, reactionType: prevReaction }));
                setEngagement((prev) => ({ ...prev, likes: prevLikes, dislikes: prevDislikes }));
                toast("Network error. Could not update reaction.");
            }
        }
    };

    // Instant (0ms) Bookmark Handler
    const handleToggleBookmark = async () => {
        const prevBookmarked = userState.isBookmarked;
        const nextBookmarked = !prevBookmarked;

        setUserState((prev) => ({ ...prev, isBookmarked: nextBookmarked }));
        toast(nextBookmarked ? "Saved to bookmarks" : "Removed bookmark");

        const seq = ++bookmarkSeqRef.current;

        try {
            const result = await toggleBookmark(postId, nextBookmarked);
            if (!result.success) {
                if (bookmarkSeqRef.current === seq) {
                    setUserState((prev) => ({ ...prev, isBookmarked: prevBookmarked }));
                    toast(result.message || "Failed to update bookmark");
                }
            }
        } catch {
            if (bookmarkSeqRef.current === seq) {
                setUserState((prev) => ({ ...prev, isBookmarked: prevBookmarked }));
                toast("Network error. Could not update bookmark.");
            }
        }
    };

    // Instant (0ms) Author Subscription Handler
    const handleToggleSubscription = async () => {
        const prevSubscribed = userState.isSubscribed;
        const prevSubscribers = engagement.subscribers;
        const nextSubscribed = !prevSubscribed;
        const nextSubscribers = nextSubscribed
            ? prevSubscribers + 1
            : Math.max(0, prevSubscribers - 1);

        setUserState((prev) => ({
            ...prev,
            isSubscribed: nextSubscribed,
            notifyOnAuthorPost: nextSubscribed ? prev.notifyOnAuthorPost : false,
        }));
        setEngagement((prev) => ({ ...prev, subscribers: nextSubscribers }));
        toast(nextSubscribed ? `Subscribed to ${authorName}` : `Unsubscribed from ${authorName}`);

        const seq = ++subscribeSeqRef.current;

        try {
            const result = await toggleAuthorSubscription(authorId, nextSubscribed);
            if (!result.success) {
                if (subscribeSeqRef.current === seq) {
                    setUserState((prev) => ({ ...prev, isSubscribed: prevSubscribed }));
                    setEngagement((prev) => ({ ...prev, subscribers: prevSubscribers }));
                    toast(result.message || "Failed to update subscription");
                }
            }
        } catch {
            if (subscribeSeqRef.current === seq) {
                setUserState((prev) => ({ ...prev, isSubscribed: prevSubscribed }));
                setEngagement((prev) => ({ ...prev, subscribers: prevSubscribers }));
                toast("Network error. Could not update subscription.");
            }
        }
    };

    // Instant (0ms) Notification Toggle Handler
    const handleToggleNotify = async () => {
        if (!userState.isSubscribed) {
            toast("Subscribe to the author first");
            return;
        }

        const prevNotify = userState.notifyOnAuthorPost;
        const nextNotify = !prevNotify;

        setUserState((prev) => ({ ...prev, notifyOnAuthorPost: nextNotify }));
        toast(nextNotify ? "Notifications on for new posts" : "Notifications turned off");

        try {
            const result = await toggleAuthorNotify(authorId);
            if (!result.success) {
                setUserState((prev) => ({ ...prev, notifyOnAuthorPost: prevNotify }));
                toast(result.message || "Failed to update notification setting");
            }
        } catch {
            setUserState((prev) => ({ ...prev, notifyOnAuthorPost: prevNotify }));
            toast("Network error. Could not update notification setting.");
        }
    };

    // Share Handler
    const handleShare = async () => {
        const postUrl = `${window.location.origin}/post/${slug}`;
        try {
            await navigator.clipboard.writeText(postUrl);
            setEngagement((prev) => ({ ...prev, shares: prev.shares + 1 }));
            toast("Post link copied and share tracked");
            recordPostShare(postId, "copy_link").catch(() => {});
        } catch {
            toast("Unable to copy link");
        }
    };

    // Not Interested Handler
    const handleNotInterested = async () => {
        setUserState((prev) => ({ ...prev, isNotInterested: true }));
        toast("Got it. We will show less similar posts");

        try {
            const result = await markPostAsNotInterested(postId);
            if (!result.success) {
                setUserState((prev) => ({ ...prev, isNotInterested: false }));
                toast(result.message || "Action failed");
            }
        } catch {
            setUserState((prev) => ({ ...prev, isNotInterested: false }));
        }
    };

    // Report Handler
    const handleReport = () => {
        const trimmed = reportReason.trim();
        if (!trimmed) {
            toast("Please provide a report reason");
            return;
        }

        startTransition(async () => {
            const result = await reportPost(postId, trimmed);
            if (!result.success) {
                toast(result.message || "Failed to report post");
                return;
            }

            setEngagement((prev) => ({ ...prev, reports: prev.reports + 1 }));
            setUserState((prev) => ({ ...prev, isNotInterested: true }));
            toast("Post reported. It will be hidden from your feed.");
            setReportReason("");
        });
    };

    const isLiked = userState.reactionType === "like";
    const isDisliked = userState.reactionType === "dislike";

    return (
        <section className="rounded-lg border p-4">
            {/* Engagement Metrics Summary */}
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

            {/* Interactive Action Buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Like Button with 0ms Instant Feedback & Tactile Pop */}
                <Button
                    type="button"
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleReaction("like")}
                    className={cn(
                        "cursor-pointer select-none transition-all duration-200 active:scale-95",
                        isLiked &&
                            "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 border-blue-600 shadow-sm shadow-blue-500/20"
                    )}
                >
                    <ThumbsUp
                        className={cn(
                            "mr-1.5 h-4 w-4 transition-transform duration-200",
                            isLiked && "fill-current scale-110"
                        )}
                    />
                    <span>Like ({engagement.likes})</span>
                </Button>

                {/* Dislike Button with 0ms Instant Feedback */}
                <Button
                    type="button"
                    variant={isDisliked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleReaction("dislike")}
                    className={cn(
                        "cursor-pointer select-none transition-all duration-200 active:scale-95",
                        isDisliked &&
                            "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500 border-red-600 shadow-sm shadow-red-500/20"
                    )}
                >
                    <ThumbsDown
                        className={cn(
                            "mr-1.5 h-4 w-4 transition-transform duration-200",
                            isDisliked && "fill-current scale-110"
                        )}
                    />
                    <span>Dislike ({engagement.dislikes})</span>
                </Button>

                {/* Bookmark Button */}
                <Button
                    type="button"
                    variant={userState.isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleBookmark}
                    className={cn(
                        "cursor-pointer select-none transition-all duration-200 active:scale-95",
                        userState.isBookmarked &&
                            "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 border-amber-600 shadow-sm shadow-amber-500/20"
                    )}
                >
                    <Bookmark
                        className={cn(
                            "mr-1.5 h-4 w-4 transition-transform duration-200",
                            userState.isBookmarked && "fill-current scale-110"
                        )}
                    />
                    <span>{userState.isBookmarked ? "Saved" : "Save Post"}</span>
                </Button>

                {/* Subscribe Button */}
                <Button
                    type="button"
                    variant={userState.isSubscribed ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleSubscription}
                    className={cn(
                        "cursor-pointer select-none transition-all duration-200 active:scale-95",
                        userState.isSubscribed &&
                            "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 border-emerald-600"
                    )}
                >
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    <span>{userState.isSubscribed ? "Subscribed" : `Subscribe ${authorName}`}</span>
                </Button>

                {/* Notify on Author Post */}
                <Button
                    type="button"
                    variant={userState.notifyOnAuthorPost ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleNotify}
                    disabled={!userState.isSubscribed}
                    className="cursor-pointer select-none transition-all duration-200 active:scale-95"
                >
                    <Bell
                        className={cn(
                            "mr-1.5 h-4 w-4 transition-transform duration-200",
                            userState.notifyOnAuthorPost && "fill-current scale-110"
                        )}
                    />
                    <span>{userState.notifyOnAuthorPost ? "Notifications On" : "Notify on new posts"}</span>
                </Button>

                {/* Share Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="cursor-pointer select-none transition-all duration-200 active:scale-95"
                >
                    <Share2 className="mr-1.5 h-4 w-4" />
                    <span>Share Post</span>
                </Button>

                {/* Not Interested Button */}
                <Button
                    type="button"
                    variant={userState.isNotInterested ? "default" : "outline"}
                    size="sm"
                    onClick={handleNotInterested}
                    disabled={userState.isNotInterested}
                    className="cursor-pointer select-none transition-all duration-200 active:scale-95"
                >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    <span>Not Interested</span>
                </Button>
            </div>

            {/* Report Post Section */}
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
