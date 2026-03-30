import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from ".";
import { getOrSetRedisCache } from "@/lib/cache/redis-cache";
import {
    authorBlockWords,
    authorSubscriptions,
    bookmarks,
    comments,
    notInterestedPosts,
    notificationPreferences,
    postReactions,
    postRevisions,
    postReports,
    postShares,
    postTags,
    postViews,
    posts,
    tags,
    users,
} from "./schema";

let hasCheckedPostLifecycleColumns = false;
let hasPostLifecycleColumns = false;

async function canUsePostLifecycleColumns() {
    if (hasCheckedPostLifecycleColumns) {
        return hasPostLifecycleColumns;
    }

    try {
        const result = await db.execute(sql`
            select count(*)::int as count
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'posts'
              and column_name in ('status', 'scheduled_at', 'published_at')
        `);

        const countValue = Number((result.rows?.[0] as { count?: number | string } | undefined)?.count ?? 0);
        hasPostLifecycleColumns = countValue === 3;
    } catch {
        hasPostLifecycleColumns = false;
    }

    hasCheckedPostLifecycleColumns = true;
    return hasPostLifecycleColumns;
}

async function publishDueScheduledPosts() {
    const supportsPostLifecycle = await canUsePostLifecycleColumns();

    if (!supportsPostLifecycle) {
        return;
    }

    await db
        .update(posts)
        .set({
            published: true,
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(and(eq(posts.published, false), sql`${posts.scheduledAt} is not null and ${posts.scheduledAt} <= now()`));
}

async function runCached<T>(
    keyParts: string[],
    tags: string[],
    revalidateSeconds: number,
    getData: () => Promise<T>
) {
    return getOrSetRedisCache({
        keyParts,
        tags,
        ttlSeconds: revalidateSeconds,
        getData,
    });
}


//get all posts
export async function getAllPosts(userId?: string) {
    try {
        await publishDueScheduledPosts();

        return runCached(
            ["getAllPosts", userId ?? "anon"],
            ["posts", userId ? `feed:${userId}` : "feed:anon"],
            30,
            async () => {
                const allPosts = await db.query.posts.findMany({
                    where: eq(posts.published, true),
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
            }
        );

    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getPostBySlug(slug: string) {

    try {
        await publishDueScheduledPosts();

        return runCached(
            ["getPostBySlug", slug],
            ["posts", `post:${slug}`],
            60,
            async () => db.query.posts.findFirst({
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
        );
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

export async function getYourPosts(userId: string) {

    try {
        await publishDueScheduledPosts();

        return runCached(
            ["getYourPosts", userId],
            ["posts", `feed:${userId}`],
            30,
            async () => db.query.posts.findMany({
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
            })
        );
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getPostsByTag(tagSlug: string) {
    try {
        await publishDueScheduledPosts();

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
            posts: tagMappings.map((item) => item.post).filter((item) => Boolean(item?.published)),
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

interface AnalyticsFilters {
    startDate?: Date;
    endDate?: Date;
    comparePreviousPeriod?: boolean;
}

export async function getAuthorAnalytics(authorId: string, filters?: AnalyticsFilters) {
    const toSafeNumber = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    await publishDueScheduledPosts();

    const startDate = filters?.startDate;
    const endDate = filters?.endDate;

    const viewDateFilter = startDate && endDate
        ? sql` and pv.created_at >= ${startDate} and pv.created_at < ${endDate}`
        : sql``;
    const reactionDateFilter = startDate && endDate
        ? sql` and pr.created_at >= ${startDate} and pr.created_at < ${endDate}`
        : sql``;
    const commentDateFilter = startDate && endDate
        ? sql` and c.created_at >= ${startDate} and c.created_at < ${endDate}`
        : sql``;
    const bookmarkDateFilter = startDate && endDate
        ? sql` and b.created_at >= ${startDate} and b.created_at < ${endDate}`
        : sql``;
    const shareDateFilter = startDate && endDate
        ? sql` and ps.created_at >= ${startDate} and ps.created_at < ${endDate}`
        : sql``;

    const getSummary = async (rangeStart?: Date, rangeEnd?: Date) => {
        const rangeViewFilter = rangeStart && rangeEnd
            ? sql` and pv.created_at >= ${rangeStart} and pv.created_at < ${rangeEnd}`
            : sql``;
        const rangeReactionFilter = rangeStart && rangeEnd
            ? sql` and pr.created_at >= ${rangeStart} and pr.created_at < ${rangeEnd}`
            : sql``;
        const rangeCommentFilter = rangeStart && rangeEnd
            ? sql` and c.created_at >= ${rangeStart} and c.created_at < ${rangeEnd}`
            : sql``;
        const rangeBookmarkFilter = rangeStart && rangeEnd
            ? sql` and b.created_at >= ${rangeStart} and b.created_at < ${rangeEnd}`
            : sql``;
        const rangeShareFilter = rangeStart && rangeEnd
            ? sql` and ps.created_at >= ${rangeStart} and ps.created_at < ${rangeEnd}`
            : sql``;
        const rangeSubscriberFilter = rangeStart && rangeEnd
            ? sql` and s.created_at >= ${rangeStart} and s.created_at < ${rangeEnd}`
            : sql``;

        const [rawSummary] = await db
            .select({
                totalPosts: sql<number>`count(*)::int`,
                totalViews: sql<number>`coalesce((select count(*) from post_views pv inner join posts p on p.id = pv.post_id where p.author_id = ${authorId} ${rangeViewFilter}), 0)::int`,
                totalLikes: sql<number>`coalesce((select count(*) from post_reactions pr inner join posts p on p.id = pr.post_id where p.author_id = ${authorId} and pr.type = 'like' ${rangeReactionFilter}), 0)::int`,
                totalDislikes: sql<number>`coalesce((select count(*) from post_reactions pr inner join posts p on p.id = pr.post_id where p.author_id = ${authorId} and pr.type = 'dislike' ${rangeReactionFilter}), 0)::int`,
                totalComments: sql<number>`coalesce((select count(*) from comments c inner join posts p on p.id = c.post_id where p.author_id = ${authorId} and c.status = 'approved' ${rangeCommentFilter}), 0)::int`,
                totalBookmarks: sql<number>`coalesce((select count(*) from bookmarks b inner join posts p on p.id = b.post_id where p.author_id = ${authorId} ${rangeBookmarkFilter}), 0)::int`,
                totalShares: sql<number>`coalesce((select count(*) from post_shares ps inner join posts p on p.id = ps.post_id where p.author_id = ${authorId} ${rangeShareFilter}), 0)::int`,
                totalSubscribers: sql<number>`coalesce((select count(*) from author_subscriptions s where s.author_id = ${authorId} ${rangeSubscriberFilter}), 0)::int`,
                uniqueVisitors: sql<number>`coalesce((select count(distinct coalesce(pv.user_id, pv.session_id, pv.ip_address)) from post_views pv inner join posts p on p.id = pv.post_id where p.author_id = ${authorId} ${rangeViewFilter}), 0)::int`,
                returningVisitors: sql<number>`coalesce((select count(*) from (select coalesce(pv.user_id, pv.session_id, pv.ip_address) as visitor, count(*) as visit_count from post_views pv inner join posts p on p.id = pv.post_id where p.author_id = ${authorId} ${rangeViewFilter} group by coalesce(pv.user_id, pv.session_id, pv.ip_address) having count(*) > 1) as v), 0)::int`,
                avgSessionDuration: sql<number>`coalesce((select avg(pv.duration_seconds) from post_views pv inner join posts p on p.id = pv.post_id where p.author_id = ${authorId} ${rangeViewFilter}), 0)::float`,
            })
            .from(posts)
            .where(eq(posts.authorId, authorId));

        return {
            totalPosts: toSafeNumber(rawSummary?.totalPosts),
            totalViews: toSafeNumber(rawSummary?.totalViews),
            totalLikes: toSafeNumber(rawSummary?.totalLikes),
            totalDislikes: toSafeNumber(rawSummary?.totalDislikes),
            totalComments: toSafeNumber(rawSummary?.totalComments),
            totalBookmarks: toSafeNumber(rawSummary?.totalBookmarks),
            totalShares: toSafeNumber(rawSummary?.totalShares),
            totalSubscribers: toSafeNumber(rawSummary?.totalSubscribers),
            uniqueVisitors: toSafeNumber(rawSummary?.uniqueVisitors),
            returningVisitors: toSafeNumber(rawSummary?.returningVisitors),
            avgSessionDuration: Number(toSafeNumber(rawSummary?.avgSessionDuration).toFixed(1)),
        };
    };

    const normalizedSummary = await getSummary(startDate, endDate);

    const postBreakdown = await db
        .select({
            postId: posts.id,
            title: posts.title,
            slug: posts.slug,
            views: sql<number>`coalesce((select count(*) from post_views pv where pv.post_id = posts.id ${viewDateFilter}), 0)::int`,
            likes: sql<number>`coalesce((select count(*) from post_reactions pr where pr.post_id = posts.id and pr.type = 'like' ${reactionDateFilter}), 0)::int`,
            dislikes: sql<number>`coalesce((select count(*) from post_reactions pr where pr.post_id = posts.id and pr.type = 'dislike' ${reactionDateFilter}), 0)::int`,
            comments: sql<number>`coalesce((select count(*) from comments c where c.post_id = posts.id and c.status = 'approved' ${commentDateFilter}), 0)::int`,
            bookmarks: sql<number>`coalesce((select count(*) from bookmarks b where b.post_id = posts.id ${bookmarkDateFilter}), 0)::int`,
            shares: sql<number>`coalesce((select count(*) from post_shares ps where ps.post_id = posts.id ${shareDateFilter}), 0)::int`,
            subscribers: sql<number>`coalesce((select count(*) from author_subscriptions s where s.author_id = posts.author_id), 0)::int`,
        })
        .from(posts)
        .where(and(eq(posts.authorId, authorId), eq(posts.published, true)))
        .orderBy(desc(posts.createdAt));

    const normalizedBreakdown = postBreakdown.map((item) => ({
        ...item,
        views: toSafeNumber(item.views),
        likes: toSafeNumber(item.likes),
        dislikes: toSafeNumber(item.dislikes),
        comments: toSafeNumber(item.comments),
        bookmarks: toSafeNumber(item.bookmarks),
        shares: toSafeNumber(item.shares),
        subscribers: toSafeNumber(item.subscribers),
    }));

    let compareSummary: null | {
        previous: typeof normalizedSummary;
        deltas: Record<string, number>;
    } = null;

    if (filters?.comparePreviousPeriod && startDate && endDate) {
        const rangeMs = Math.max(1, endDate.getTime() - startDate.getTime());
        const previousStart = new Date(startDate.getTime() - rangeMs);
        const previousEnd = new Date(startDate.getTime());
        const previous = await getSummary(previousStart, previousEnd);

        const calcDelta = (current: number, before: number) => {
            if (before === 0) {
                return current > 0 ? 100 : 0;
            }
            return Number((((current - before) / before) * 100).toFixed(1));
        };

        compareSummary = {
            previous,
            deltas: {
                totalViews: calcDelta(normalizedSummary.totalViews, previous.totalViews),
                totalLikes: calcDelta(normalizedSummary.totalLikes, previous.totalLikes),
                totalComments: calcDelta(normalizedSummary.totalComments, previous.totalComments),
                totalBookmarks: calcDelta(normalizedSummary.totalBookmarks, previous.totalBookmarks),
                totalShares: calcDelta(normalizedSummary.totalShares, previous.totalShares),
                uniqueVisitors: calcDelta(normalizedSummary.uniqueVisitors, previous.uniqueVisitors),
                returningVisitors: calcDelta(normalizedSummary.returningVisitors, previous.returningVisitors),
                avgSessionDuration: calcDelta(normalizedSummary.avgSessionDuration, previous.avgSessionDuration),
            },
        };
    }

    return {
        summary: normalizedSummary,
        postBreakdown: normalizedBreakdown,
        comparison: compareSummary,
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
        await publishDueScheduledPosts();

        const subscriptions = await db.query.authorSubscriptions.findMany({
            where: eq(authorSubscriptions.userId, userId),
        });

        const authorIds = subscriptions.map((subscription) => subscription.authorId);
        if (!authorIds.length) {
            return [];
        }

        const allPosts = await db.query.posts.findMany({
            where: eq(posts.published, true),
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
        await publishDueScheduledPosts();

        const notifySubscriptions = await db.query.authorSubscriptions.findMany({
            where: and(eq(authorSubscriptions.userId, userId), eq(authorSubscriptions.notifyOnPost, true)),
        });

        const authorIds = notifySubscriptions.map((subscription) => subscription.authorId);
        if (!authorIds.length) {
            return [];
        }

        const allPosts = await db.query.posts.findMany({
            where: eq(posts.published, true),
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

export async function getPostRevisionHistory(postId: number, authorId: string) {
    const post = await db.query.posts.findFirst({
        where: and(eq(posts.id, postId), eq(posts.authorId, authorId)),
    });

    if (!post) {
        return [];
    }

    return db.query.postRevisions.findMany({
        where: eq(postRevisions.postId, postId),
        orderBy: [desc(postRevisions.createdAt)],
    });
}

export async function getFollowedAuthorsFeed(userId: string) {
    await publishDueScheduledPosts();

    return runCached(
        ["getFollowedAuthorsFeed", userId],
        ["posts", `feed:${userId}`],
        30,
        async () => {
            const subscriptions = await db.query.authorSubscriptions.findMany({
                where: eq(authorSubscriptions.userId, userId),
            });

            const authorIds = subscriptions.map((item) => item.authorId);
            if (!authorIds.length) {
                return [];
            }

            return db.query.posts.findMany({
                where: and(inArray(posts.authorId, authorIds), eq(posts.published, true)),
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
        }
    );
}

export async function getSmartRecommendations(userId?: string, limit = 6) {
    await publishDueScheduledPosts();

    const allPosts = await db.query.posts.findMany({
        where: eq(posts.published, true),
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

    if (!userId) {
        return allPosts.slice(0, limit);
    }

    const [viewed, bookmarked, reacted] = await Promise.all([
        db.query.postViews.findMany({ where: eq(postViews.userId, userId) }),
        db.query.bookmarks.findMany({ where: eq(bookmarks.userId, userId) }),
        db.query.postReactions.findMany({ where: eq(postReactions.userId, userId) }),
    ]);

    const interactedPostIds = new Set<number>([
        ...viewed.map((item) => item.postId),
        ...bookmarked.map((item) => item.postId),
        ...reacted.map((item) => item.postId),
    ]);

    const interactedTagSlugs = new Set<string>();
    allPosts.forEach((post) => {
        if (interactedPostIds.has(post.id)) {
            (post.postTags ?? []).forEach((tagMapping) => interactedTagSlugs.add(tagMapping.tag.slug));
        }
    });

    const scored = allPosts
        .filter((post) => !interactedPostIds.has(post.id) && post.authorId !== userId)
        .map((post) => {
            const tagMatches = (post.postTags ?? []).filter((tagMapping) => interactedTagSlugs.has(tagMapping.tag.slug)).length;
            const freshness = Math.max(0, 100 - Math.floor((Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
            return {
                post,
                score: tagMatches * 10 + freshness,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.post);

    return scored.length ? scored : allPosts.slice(0, limit);
}

interface AdvancedSearchFilters {
    query?: string;
    tag?: string;
    author?: string;
    sort?: "newest" | "trending";
    minReadMinutes?: number;
    dateFrom?: Date;
    dateTo?: Date;
}

export async function searchPostsAdvanced(filters: AdvancedSearchFilters, userId?: string) {
    const postsList = await getAllPosts(userId);
    const query = (filters.query ?? "").trim().toLowerCase();
    const tag = (filters.tag ?? "").trim().toLowerCase();
    const author = (filters.author ?? "").trim().toLowerCase();

    const withMetrics = await Promise.all(postsList.map(async (post) => {
        const viewsRow = await db
            .select({ count: count() })
            .from(postViews)
            .where(eq(postViews.postId, post.id));

        const words = post.content.trim().split(/\s+/).filter(Boolean).length;
        const readMinutes = Math.max(1, Math.ceil(words / 200));

        return {
            ...post,
            views: Number(viewsRow[0]?.count ?? 0),
            readMinutes,
        };
    }));

    const filtered = withMetrics.filter((post) => {
        const haystack = `${post.title} ${post.description} ${post.content} ${post.author?.name ?? ""}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesTag = !tag || (post.postTags ?? []).some((tagMapping) => tagMapping.tag.slug.includes(tag) || tagMapping.tag.name.toLowerCase().includes(tag));
        const matchesAuthor = !author || (post.author?.name ?? "").toLowerCase().includes(author);
        const matchesRead = !filters.minReadMinutes || post.readMinutes >= filters.minReadMinutes;
        const matchesDateFrom = !filters.dateFrom || post.createdAt >= filters.dateFrom;
        const matchesDateTo = !filters.dateTo || post.createdAt <= filters.dateTo;

        return matchesQuery && matchesTag && matchesAuthor && matchesRead && matchesDateFrom && matchesDateTo;
    });

    if (filters.sort === "trending") {
        filtered.sort((a, b) => b.views - a.views || b.createdAt.getTime() - a.createdAt.getTime());
    } else {
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
}

export async function getModerationDashboard(authorId: string) {
    const authorPosts = await db.query.posts.findMany({
        where: eq(posts.authorId, authorId),
        columns: { id: true, title: true, slug: true },
    });

    const postIds = authorPosts.map((post) => post.id);
    if (!postIds.length) {
        return {
            reports: [],
            commentsQueue: [],
            blockedWords: [],
        };
    }

    const [reports, commentsQueue, blockedWords] = await Promise.all([
        db.query.postReports.findMany({
            where: and(inArray(postReports.postId, postIds), eq(postReports.status, "open")),
            orderBy: [desc(postReports.createdAt)],
            with: { post: true, user: true },
        }),
        db.query.comments.findMany({
            where: and(inArray(comments.postId, postIds), eq(comments.status, "pending")),
            orderBy: [desc(comments.createdAt)],
            with: { post: true, user: true },
        }),
        db.query.authorBlockWords.findMany({
            where: eq(authorBlockWords.authorId, authorId),
            orderBy: [asc(authorBlockWords.word)],
        }),
    ]);

    return {
        reports,
        commentsQueue,
        blockedWords,
    };
}

export async function getNotificationPreferences(userId: string) {
    const [existing] = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

    if (existing) {
        return existing;
    }

    const [created] = await db.insert(notificationPreferences).values({ userId }).returning();
    return created;
}

export async function getNotificationCenter(userId: string) {
    const prefs = await getNotificationPreferences(userId);

    const [followedPosts, commentsOnMyPosts, repliesToMyComments] = await Promise.all([
        prefs.notifyNewPostsFromFollowedAuthors ? getSubscribedAuthorNotifications(userId) : Promise.resolve([]),
        prefs.notifyCommentsOnMyPosts
            ? db
                .select({
                    commentId: comments.id,
                    content: comments.content,
                    createdAt: comments.createdAt,
                    postSlug: posts.slug,
                    postTitle: posts.title,
                    commenterName: users.name,
                })
                .from(comments)
                .innerJoin(posts, eq(comments.postId, posts.id))
                .innerJoin(users, eq(comments.userId, users.id))
                .where(and(eq(posts.authorId, userId), ne(comments.userId, userId), eq(comments.status, "approved")))
                .orderBy(desc(comments.createdAt))
                .limit(20)
            : Promise.resolve([]),
        prefs.notifyRepliesToMyComments
            ? db.execute(sql`
                select child.id as "commentId", child.content as "content", child.created_at as "createdAt", p.slug as "postSlug", p.title as "postTitle", u.name as "commenterName"
                from comments child
                inner join comments parent on parent.id = child.parent_id
                inner join posts p on p.id = child.post_id
                inner join users u on u.id = child.user_id
                where parent.user_id = ${userId}
                  and child.user_id <> ${userId}
                  and child.status = 'approved'
                order by child.created_at desc
                limit 20
            `)
            : Promise.resolve({ rows: [] as Array<Record<string, unknown>> }),
    ]);

    return {
        preferences: prefs,
        followedPosts,
        commentsOnMyPosts,
        repliesToMyComments: "rows" in repliesToMyComments ? repliesToMyComments.rows : repliesToMyComments,
    };
}