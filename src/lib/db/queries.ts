import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from ".";
import {
    authorSubscriptions,
    bookmarks,
    comments,
    notInterestedPosts,
    postReactions,
    postReports,
    postShares,
    postTags,
    postViews,
    posts,
    tags,
} from "./schema";



//get all posts
export async function getAllPosts(userId?: string) {
    try {

        const allPosts = await db.query.posts.findMany({
            orderBy: [desc(posts.createdAt)],
            with: {
                author: true,
                postTags: {
                    with: {
                        tag: true,
                    },
                },
            }
        })

        if (!userId) {
            return allPosts;
        }

        const hidden = await db.query.notInterestedPosts.findMany({
            where: eq(notInterestedPosts.userId, userId),
        });

        const reported = await db.query.postReports.findMany({
            where: eq(postReports.userId, userId),
        });

        const hiddenPostIds = new Set(hidden.map((entry) => entry.postId));
        const reportedPostIds = new Set(reported.map((entry) => entry.postId));

        return allPosts.filter((post) => !hiddenPostIds.has(post.id) && !reportedPostIds.has(post.id));

    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getPostBySlug(slug: string) {

    try {
        const post = await db.query.posts.findFirst({
            where: eq(posts.slug, slug),
            with: {
                author: true,
                postTags: {
                    with: {
                        tag: true,
                    },
                },
            }
        })

        return post;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getPostById(id: number) {

    try {
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, id),
            with: {
                author: true,
                postTags: {
                    with: {
                        tag: true,
                    },
                },
            }
        })

        return post;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getYourPosts(userId: string){
 
    try{

        const OwnPosts = await db.query.posts.findMany({
            where: eq(posts.authorId, userId),
            orderBy: [desc(posts.createdAt)],
            with: {
                author: true,
                postTags: {
                    with: {
                        tag: true,
                    },
                },
            }
        });

        return OwnPosts;
    } catch(e){
        console.log(e);
        return null;
    }
}

export async function getPostsByTag(tagSlug: string) {
    try {
        const tag = await db.query.tags.findFirst({
            where: eq(tags.slug, tagSlug),
        });

        if (!tag) {
            return { tag: null, posts: [] };
        }

        const tagMappings = await db.query.postTags.findMany({
            where: eq(postTags.tagId, tag.id),
            with: {
                post: {
                    with: {
                        author: true,
                        postTags: {
                            with: {
                                tag: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            tag,
            posts: tagMappings.map((item) => item.post).filter(Boolean),
        };
    } catch (e) {
        console.log(e);
        return { tag: null, posts: [] };
    }
}

export async function getPostEngagementCounts(postId: number) {
    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
    });

    const [likeCountRow] = await db
        .select({ count: count() })
        .from(postReactions)
        .where(and(eq(postReactions.postId, postId), eq(postReactions.type, "like")));

    const [dislikeCountRow] = await db
        .select({ count: count() })
        .from(postReactions)
        .where(and(eq(postReactions.postId, postId), eq(postReactions.type, "dislike")));

    const [commentCountRow] = await db
        .select({ count: count() })
        .from(comments)
        .where(and(eq(comments.postId, postId), eq(comments.status, "approved")));

    const [viewCountRow] = await db
        .select({ count: count() })
        .from(postViews)
        .where(eq(postViews.postId, postId));

    const [bookmarkCountRow] = await db
        .select({ count: count() })
        .from(bookmarks)
        .where(eq(bookmarks.postId, postId));

    const [subscriberCountRow] = await db
        .select({ count: count() })
        .from(authorSubscriptions)
        .where(eq(authorSubscriptions.authorId, post?.authorId ?? ""));

    const [shareCountRow] = await db
        .select({ count: count() })
        .from(postShares)
        .where(eq(postShares.postId, postId));

    const [reportCountRow] = await db
        .select({ count: count() })
        .from(postReports)
        .where(eq(postReports.postId, postId));

    return {
        likes: likeCountRow?.count ?? 0,
        dislikes: dislikeCountRow?.count ?? 0,
        comments: commentCountRow?.count ?? 0,
        views: viewCountRow?.count ?? 0,
        bookmarks: bookmarkCountRow?.count ?? 0,
        subscribers: subscriberCountRow?.count ?? 0,
        shares: shareCountRow?.count ?? 0,
        reports: reportCountRow?.count ?? 0,
    };
}

export async function getUserPostEngagementState(postId: number, userId?: string) {
    if (!userId) {
        return {
            reactionType: null as "like" | "dislike" | null,
            isBookmarked: false,
            isSubscribed: false,
            notifyOnAuthorPost: false,
            isNotInterested: false,
        };
    }

    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
    });

    const [reaction] = await db
        .select()
        .from(postReactions)
        .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)))
        .limit(1);

    const [bookmark] = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, userId)))
        .limit(1);

    const [subscription] = await db
        .select()
        .from(authorSubscriptions)
        .where(and(eq(authorSubscriptions.authorId, post?.authorId ?? ""), eq(authorSubscriptions.userId, userId)))
        .limit(1);

    const [notInterested] = await db
        .select()
        .from(notInterestedPosts)
        .where(and(eq(notInterestedPosts.postId, postId), eq(notInterestedPosts.userId, userId)))
        .limit(1);

    const reactionType: "like" | "dislike" | null =
        reaction?.type === "like" || reaction?.type === "dislike"
            ? reaction.type
            : null;

    return {
        reactionType,
        isBookmarked: Boolean(bookmark),
        isSubscribed: Boolean(subscription),
        notifyOnAuthorPost: Boolean(subscription?.notifyOnPost),
        isNotInterested: Boolean(notInterested),
    };
}

export async function getPostCommentsWithReplies(postId: number) {
    const allComments = await db.query.comments.findMany({
        where: eq(comments.postId, postId),
        with: {
            user: true,
        },
        orderBy: [desc(comments.createdAt)],
    });

    const visible = allComments.filter((comment) => comment.status === "approved");

    const topLevel = visible.filter((comment) => !comment.parentId);

    return topLevel.map((comment) => ({
        ...comment,
        replies: visible
            .filter((reply) => reply.parentId === comment.id)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    }));
}

export async function getAuthorAnalytics(authorId: string) {
    const [summary] = await db
        .select({
            totalPosts: sql<number>`count(*)::int`,
            totalViews: sql<number>`coalesce((select count(*) from post_views pv inner join posts p on p.id = pv.post_id where p.author_id = ${authorId}), 0)::int`,
            totalLikes: sql<number>`coalesce((select count(*) from post_reactions pr inner join posts p on p.id = pr.post_id where p.author_id = ${authorId} and pr.type = 'like'), 0)::int`,
            totalDislikes: sql<number>`coalesce((select count(*) from post_reactions pr inner join posts p on p.id = pr.post_id where p.author_id = ${authorId} and pr.type = 'dislike'), 0)::int`,
            totalComments: sql<number>`coalesce((select count(*) from comments c inner join posts p on p.id = c.post_id where p.author_id = ${authorId} and c.status = 'approved'), 0)::int`,
            totalBookmarks: sql<number>`coalesce((select count(*) from bookmarks b inner join posts p on p.id = b.post_id where p.author_id = ${authorId}), 0)::int`,
            totalShares: sql<number>`coalesce((select count(*) from post_shares ps inner join posts p on p.id = ps.post_id where p.author_id = ${authorId}), 0)::int`,
            totalSubscribers: sql<number>`coalesce((select count(*) from author_subscriptions s where s.author_id = ${authorId}), 0)::int`,
        })
        .from(posts)
        .where(eq(posts.authorId, authorId));

    const postBreakdown = await db
        .select({
            postId: posts.id,
            title: posts.title,
            slug: posts.slug,
            views: sql<number>`coalesce((select count(*) from post_views pv where pv.post_id = ${posts.id}), 0)::int`,
            likes: sql<number>`coalesce((select count(*) from post_reactions pr where pr.post_id = ${posts.id} and pr.type = 'like'), 0)::int`,
            dislikes: sql<number>`coalesce((select count(*) from post_reactions pr where pr.post_id = ${posts.id} and pr.type = 'dislike'), 0)::int`,
            comments: sql<number>`coalesce((select count(*) from comments c where c.post_id = ${posts.id} and c.status = 'approved'), 0)::int`,
            bookmarks: sql<number>`coalesce((select count(*) from bookmarks b where b.post_id = ${posts.id}), 0)::int`,
            shares: sql<number>`coalesce((select count(*) from post_shares ps where ps.post_id = ${posts.id}), 0)::int`,
            subscribers: sql<number>`coalesce((select count(*) from author_subscriptions s where s.author_id = ${posts.authorId}), 0)::int`,
        })
        .from(posts)
        .where(eq(posts.authorId, authorId))
        .orderBy(desc(posts.createdAt));

    return {
        summary: summary ?? {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalDislikes: 0,
            totalComments: 0,
            totalBookmarks: 0,
            totalShares: 0,
            totalSubscribers: 0,
        },
        postBreakdown,
    };
}

export async function getSavedPosts(userId: string) {
    try {
        const savedEntries = await db.query.bookmarks.findMany({
            where: eq(bookmarks.userId, userId),
            with: {
                post: {
                    with: {
                        author: true,
                        postTags: {
                            with: {
                                tag: true,
                            },
                        },
                    },
                },
            },
            orderBy: [desc(bookmarks.createdAt)],
        });

        return savedEntries.map((entry) => entry.post).filter(Boolean);
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getSuggestedPostsFromSubscribedAuthors(userId: string) {
    try {
        const subscriptions = await db.query.authorSubscriptions.findMany({
            where: eq(authorSubscriptions.userId, userId),
        });

        const authorIds = subscriptions.map((subscription) => subscription.authorId);
        if (!authorIds.length) {
            return [];
        }

        const allPosts = await db.query.posts.findMany({
            orderBy: [desc(posts.createdAt)],
            with: {
                author: true,
                postTags: {
                    with: {
                        tag: true,
                    },
                },
            },
        });

        return allPosts.filter((post) => authorIds.includes(post.authorId)).slice(0, 6);
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getSubscribedAuthorNotifications(userId: string) {
    try {
        const notifySubscriptions = await db.query.authorSubscriptions.findMany({
            where: and(eq(authorSubscriptions.userId, userId), eq(authorSubscriptions.notifyOnPost, true)),
        });

        const authorIds = notifySubscriptions.map((subscription) => subscription.authorId);
        if (!authorIds.length) {
            return [];
        }

        const allPosts = await db.query.posts.findMany({
            orderBy: [desc(posts.createdAt)],
            with: {
                author: true,
                postTags: {
                    with: {
                        tag: true,
                    },
                },
            },
        });

        return allPosts.filter((post) => authorIds.includes(post.authorId)).slice(0, 8);
    } catch (e) {
        console.log(e);
        return [];
    }
}