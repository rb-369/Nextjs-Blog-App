"use server";

import { auth } from "@/lib/auth";
import { invalidateCacheTags } from "@/lib/cache/redis-cache";
import { db } from "@/lib/db";
import {
    authorBlockWords,
    authorSubscriptions,
    bookmarks,
    comments,
    notInterestedPosts,
    notificationPreferences,
    posts,
    postReactions,
    postReports,
    postShares,
    postTags,
    postViews,
    tags,
} from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    });
}

async function requireSession() {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("You must be logged in to do this action");
    }

    return session;
}

async function revalidatePostTagsById(postId: number, viewerId?: string) {
    const tags = ["posts", "feed:anon"];

    if (viewerId) {
        tags.push(`feed:${viewerId}`);
    }

    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
        columns: {
            slug: true,
            authorId: true,
        },
    });

    if (post?.slug) {
        tags.push(`post:${post.slug}`);
    }

    if (post?.authorId) {
        tags.push(`feed:${post.authorId}`);
    }

    await invalidateCacheTags(tags);

    for (const tag of tags) {
        revalidateTag(tag, "max");
    }
}

export async function syncPostTags(postId: number, rawTagInput: string) {
    const tagsFromInput = rawTagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 10);

    const deduped = Array.from(new Set(tagsFromInput.map((item) => item.toLowerCase())));

    await db.delete(postTags).where(eq(postTags.postId, postId));

    if (!deduped.length) {
        return;
    }

    for (const lowerTag of deduped) {
        const displayName = lowerTag
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");

        const tagSlug = slugify(lowerTag);

        let tag = await db.query.tags.findFirst({ where: eq(tags.slug, tagSlug) });

        if (!tag) {
            const [insertedTag] = await db
                .insert(tags)
                .values({
                    name: displayName,
                    slug: tagSlug,
                })
                .returning();

            tag = insertedTag;
        }

        if (tag) {
            await db.insert(postTags).values({
                postId,
                tagId: tag.id,
            });
        }
    }
}

export async function togglePostReaction(postId: number, reactionType: "like" | "dislike") {
    try {
        const session = await requireSession();

        const [existing] = await db
            .select()
            .from(postReactions)
            .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, session.user.id)))
            .limit(1);

        if (!existing) {
            await db.insert(postReactions).values({
                postId,
                userId: session.user.id,
                type: reactionType,
            });
        } else if (existing.type === reactionType) {
            await db.delete(postReactions).where(eq(postReactions.id, existing.id));
        } else {
            await db
                .update(postReactions)
                .set({
                    type: reactionType,
                    updatedAt: new Date(),
                })
                .where(eq(postReactions.id, existing.id));
        }

        await revalidatePostTagsById(postId, session.user.id);
        revalidatePath("/");
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update reaction" };
    }
}

export async function toggleBookmark(postId: number) {
    try {
        const session = await requireSession();

        const [existing] = await db
            .select()
            .from(bookmarks)
            .where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, session.user.id)))
            .limit(1);

        if (existing) {
            await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
        } else {
            await db.insert(bookmarks).values({
                postId,
                userId: session.user.id,
            });
        }

        await revalidatePostTagsById(postId, session.user.id);
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update bookmark" };
    }
}

export async function toggleAuthorSubscription(authorId: string) {
    try {
        const session = await requireSession();

        if (session.user.id === authorId) {
            return { success: false, message: "You cannot subscribe to yourself" };
        }

        const [existing] = await db
            .select()
            .from(authorSubscriptions)
            .where(and(eq(authorSubscriptions.authorId, authorId), eq(authorSubscriptions.userId, session.user.id)))
            .limit(1);

        if (existing) {
            await db.delete(authorSubscriptions).where(eq(authorSubscriptions.id, existing.id));
        } else {
            await db.insert(authorSubscriptions).values({
                authorId,
                userId: session.user.id,
                notifyOnPost: true,
            });
        }

        await invalidateCacheTags([`feed:${session.user.id}`, "posts"]);
        revalidateTag(`feed:${session.user.id}`, "max");
        revalidateTag("posts", "max");
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update subscription" };
    }
}

export async function toggleAuthorNotify(authorId: string) {
    try {
        const session = await requireSession();

        const [existing] = await db
            .select()
            .from(authorSubscriptions)
            .where(and(eq(authorSubscriptions.authorId, authorId), eq(authorSubscriptions.userId, session.user.id)))
            .limit(1);

        if (!existing) {
            return { success: false, message: "Subscribe to the author first" };
        }

        await db
            .update(authorSubscriptions)
            .set({ notifyOnPost: !existing.notifyOnPost })
            .where(eq(authorSubscriptions.id, existing.id));

        await invalidateCacheTags([`feed:${session.user.id}`]);
        revalidateTag(`feed:${session.user.id}`, "max");
        revalidatePath("/analytics");
        return { success: true, notifyOnPost: !existing.notifyOnPost };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update notification setting" };
    }
}

export async function markPostAsNotInterested(postId: number) {
    try {
        const session = await requireSession();

        const [existing] = await db
            .select()
            .from(notInterestedPosts)
            .where(and(eq(notInterestedPosts.postId, postId), eq(notInterestedPosts.userId, session.user.id)))
            .limit(1);

        if (!existing) {
            await db.insert(notInterestedPosts).values({
                postId,
                userId: session.user.id,
            });
        }

        await revalidatePostTagsById(postId, session.user.id);
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to mark not interested" };
    }
}

export async function reportPost(postId: number, reason: string) {
    try {
        const session = await requireSession();

        const trimmed = reason.trim();
        if (!trimmed) {
            return { success: false, message: "Please provide a reason" };
        }

        await db.insert(postReports).values({
            postId,
            userId: session.user.id,
            reason: trimmed,
        });

        const [existingHidden] = await db
            .select()
            .from(notInterestedPosts)
            .where(and(eq(notInterestedPosts.postId, postId), eq(notInterestedPosts.userId, session.user.id)))
            .limit(1);

        if (!existingHidden) {
            await db.insert(notInterestedPosts).values({
                postId,
                userId: session.user.id,
            });
        }

        await revalidatePostTagsById(postId, session.user.id);
        revalidatePath("/");
        revalidatePath("/search");

        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to report post" };
    }
}

export async function recordPostShare(postId: number, channel = "copy_link") {
    try {
        const session = await getSession();

        await db.insert(postShares).values({
            postId,
            userId: session?.user?.id,
            channel,
        });

        await revalidatePostTagsById(postId, session?.user?.id);
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to track share" };
    }
}

export async function recordPostView(postId: number, sessionId?: string, ipAddress?: string) {
    try {
        const session = await getSession();

        await db.insert(postViews).values({
            postId,
            userId: session?.user?.id,
            sessionId,
            ipAddress,
        });

        await revalidatePostTagsById(postId, session?.user?.id);
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to track view" };
    }
}

export async function addComment(postId: number, content: string, parentId?: number) {
    try {
        const session = await requireSession();

        const trimmed = content.trim();
        if (!trimmed) {
            return { success: false, message: "Comment cannot be empty" };
        }

        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (!post) {
            return { success: false, message: "Post not found" };
        }

        const blockedWords = await db.query.authorBlockWords.findMany({
            where: eq(authorBlockWords.authorId, post.authorId),
        });

        const lowered = trimmed.toLowerCase();
        const matchedBlockedWord = blockedWords.find((item) => lowered.includes(item.word.toLowerCase()));
        const commentStatus = matchedBlockedWord ? "rejected" : "approved";

        await db.insert(comments).values({
            postId,
            userId: session.user.id,
            parentId: parentId ?? null,
            content: trimmed,
            status: commentStatus,
        });

        await revalidatePostTagsById(postId, session.user.id);
        revalidatePath(`/post`);
        revalidatePath("/analytics");
        return {
            success: true,
            message: matchedBlockedWord
                ? "Comment submitted but held by moderation filter"
                : "Comment added",
        };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to add comment" };
    }
}

export async function deleteComment(commentId: number) {
    try {
        const session = await requireSession();

        const comment = await db.query.comments.findFirst({
            where: eq(comments.id, commentId),
            with: { post: true },
        });

        if (!comment) {
            return { success: false, message: "Comment not found" };
        }

        if (comment.post.authorId !== session.user.id) {
            return { success: false, message: "Only the post author can remove comments" };
        }

        await db.delete(comments).where(eq(comments.id, commentId));
        await db.delete(comments).where(eq(comments.parentId, commentId));

        await revalidatePostTagsById(comment.postId, session.user.id);
        revalidatePath(`/post/${comment.post.slug}`);
        revalidatePath("/analytics");
        return { success: true, message: "Comment removed" };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to delete comment" };
    }
}

export async function moderateComment(commentId: number, status: "approved" | "rejected") {
    try {
        const session = await requireSession();

        const comment = await db.query.comments.findFirst({
            where: eq(comments.id, commentId),
            with: { post: true },
        });

        if (!comment) {
            return { success: false, message: "Comment not found" };
        }

        if (comment.post.authorId !== session.user.id) {
            return { success: false, message: "Only post author can moderate comments" };
        }

        await db
            .update(comments)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(comments.id, commentId));

        await revalidatePostTagsById(comment.postId, session.user.id);
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to moderate comment" };
    }
}

export async function addAuthorBlockedWord(word: string) {
    try {
        const session = await requireSession();
        const cleaned = word.trim().toLowerCase();

        if (!cleaned || cleaned.length < 2) {
            return { success: false, message: "Blocked word must be at least 2 characters" };
        }

        const [existing] = await db
            .select()
            .from(authorBlockWords)
            .where(and(eq(authorBlockWords.authorId, session.user.id), eq(authorBlockWords.word, cleaned)))
            .limit(1);

        if (!existing) {
            await db.insert(authorBlockWords).values({
                authorId: session.user.id,
                word: cleaned,
            });
        }

        revalidatePath("/moderation");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to add blocked word" };
    }
}

export async function removeAuthorBlockedWord(blockWordId: number) {
    try {
        const session = await requireSession();

        await db
            .delete(authorBlockWords)
            .where(and(eq(authorBlockWords.id, blockWordId), eq(authorBlockWords.authorId, session.user.id)));

        revalidatePath("/moderation");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to remove blocked word" };
    }
}

export async function reviewPostReport(reportId: number, status: "open" | "reviewed") {
    try {
        const session = await requireSession();
        const report = await db.query.postReports.findFirst({
            where: eq(postReports.id, reportId),
            with: { post: true },
        });

        if (!report || report.post.authorId !== session.user.id) {
            return { success: false, message: "Report not found" };
        }

        await db
            .update(postReports)
            .set({ status })
            .where(eq(postReports.id, reportId));

        revalidatePath("/moderation");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to review report" };
    }
}

export async function updateNotificationPreferences(values: {
    notifyCommentsOnMyPosts: boolean;
    notifyNewPostsFromFollowedAuthors: boolean;
    notifyRepliesToMyComments: boolean;
}) {
    try {
        const session = await requireSession();

        const [existing] = await db
            .select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.userId, session.user.id))
            .limit(1);

        if (existing) {
            await db
                .update(notificationPreferences)
                .set({
                    ...values,
                    updatedAt: new Date(),
                })
                .where(eq(notificationPreferences.id, existing.id));
        } else {
            await db.insert(notificationPreferences).values({
                userId: session.user.id,
                ...values,
            });
        }

        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update notification preferences" };
    }
}
