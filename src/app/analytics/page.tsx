import { auth } from "@/lib/auth";
import AnalyticsCharts from "@/components/analytics/analytics-charts";
import { getAuthorAnalytics } from "@/lib/db/queries";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowUpRight, BarChart3, Bookmark, Eye, MessageCircle, Share2, ThumbsDown, ThumbsUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function resolveAnalyticsRange(period: string, from?: string, to?: string) {
    const now = new Date();

    if (period === "today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return { start, end };
    }

    if (period === "7d" || period === "30d") {
        const days = period === "7d" ? 7 : 30;
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - days);
        return { start, end };
    }

    if (period === "custom" && from && to) {
        const start = new Date(from);
        const end = new Date(to);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start < end) {
            return { start, end };
        }
    }

    return { start: undefined, end: undefined };
}

async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const period = typeof params.period === "string" ? params.period : "30d";
    const from = typeof params.from === "string" ? params.from : undefined;
    const to = typeof params.to === "string" ? params.to : undefined;
    const compare = typeof params.compare === "string" ? params.compare === "1" : true;
    const range = resolveAnalyticsRange(period, from, to);

    const analytics = await getAuthorAnalytics(session.user.id, {
        startDate: range.start,
        endDate: range.end,
        comparePreviousPeriod: compare,
    });
    const summary = analytics.summary;
    const engagementTotal = summary.totalLikes + summary.totalComments + summary.totalBookmarks + summary.totalShares;
    const engagementRate = summary.totalViews > 0 ? ((engagementTotal / summary.totalViews) * 100).toFixed(1) : "0.0";
    const likeRatio = summary.totalViews > 0 ? ((summary.totalLikes / summary.totalViews) * 100).toFixed(1) : "0.0";

    const statCards = [
        {
            label: "Views",
            value: summary.totalViews,
            helper: "Total watch traffic",
            icon: Eye,
            className: "from-sky-500/20 to-blue-500/5 border-sky-500/30",
        },
        {
            label: "Subscribers",
            value: summary.totalSubscribers,
            helper: "Audience growth",
            icon: Users,
            className: "from-violet-500/20 to-indigo-500/5 border-violet-500/30",
        },
        {
            label: "Likes",
            value: summary.totalLikes,
            helper: `${likeRatio}% like-to-view rate`,
            icon: ThumbsUp,
            className: "from-emerald-500/20 to-green-500/5 border-emerald-500/30",
        },
        {
            label: "Comments",
            value: summary.totalComments,
            helper: "Conversation signal",
            icon: MessageCircle,
            className: "from-amber-500/20 to-orange-500/5 border-amber-500/30",
        },
        {
            label: "Shares",
            value: summary.totalShares,
            helper: "External distribution",
            icon: Share2,
            className: "from-fuchsia-500/20 to-pink-500/5 border-fuchsia-500/30",
        },
        {
            label: "Bookmarks",
            value: summary.totalBookmarks,
            helper: "Saved for later",
            icon: Bookmark,
            className: "from-teal-500/20 to-cyan-500/5 border-teal-500/30",
        },
        {
            label: "Dislikes",
            value: summary.totalDislikes,
            helper: "Negative feedback",
            icon: ThumbsDown,
            className: "from-rose-500/20 to-red-500/5 border-rose-500/30",
        },
        {
            label: "Posts",
            value: summary.totalPosts,
            helper: `${engagementRate}% engagement rate`,
            icon: BarChart3,
            className: "from-slate-500/20 to-zinc-500/5 border-slate-500/30",
        },
        {
            label: "Unique Visitors",
            value: summary.uniqueVisitors,
            helper: `${summary.returningVisitors} returning`,
            icon: Users,
            className: "from-lime-500/20 to-green-500/5 border-lime-500/30",
        },
        {
            label: "Avg Session",
            value: `${summary.avgSessionDuration}s`,
            helper: "Average read session",
            icon: Eye,
            className: "from-cyan-500/20 to-sky-500/5 border-cyan-500/30",
        },
    ];

    return (
        <main className="py-10">
            <section className="mb-6 overflow-hidden rounded-3xl border bg-[linear-gradient(120deg,rgba(14,165,233,0.16),rgba(15,23,42,0.08),rgba(168,85,247,0.16))] p-6 md:p-8">
                <p className="inline-flex items-center rounded-full border border-foreground/15 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Channel Performance
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">VELO Studio Analytics</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">A creator-focused performance board inspired by YouTube Studio: track audience growth, content traction, and engagement quality across your posts.</p>

                <form className="mt-5 grid grid-cols-1 gap-3 rounded-xl border bg-background/60 p-3 md:grid-cols-5" action="/analytics" method="get">
                    <select name="period" defaultValue={period} className="h-10 rounded-md border bg-background px-3 text-sm">
                        <option value="today">Today</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="custom">Custom</option>
                    </select>
                    <input name="from" type="date" defaultValue={from} className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="to" type="date" defaultValue={to} className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <label className="flex items-center gap-2 rounded-md border px-3 text-sm">
                        <input type="checkbox" name="compare" value="1" defaultChecked={compare} />
                        Compare
                    </label>
                    <button type="submit" className="h-10 rounded-md border bg-primary px-3 text-sm font-semibold text-primary-foreground">Apply</button>
                </form>

                {analytics.comparison ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Period comparison: views {analytics.comparison.deltas.totalViews}% | likes {analytics.comparison.deltas.totalLikes}% | comments {analytics.comparison.deltas.totalComments}%
                    </p>
                ) : null}
            </section>

            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map((card) => (
                    <article key={card.label} className={`rounded-2xl border bg-linear-to-br ${card.className} p-4 backdrop-blur-sm`}>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
                            <card.icon className="h-4 w-4 text-foreground/70" />
                        </div>
                        <p className="text-3xl font-black tracking-tight">{card.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                    </article>
                ))}
            </section>

            <div className="mb-8">
                <AnalyticsCharts data={analytics.postBreakdown} />
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold tracking-tight">Content Performance</h2>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest breakdown</p>
                </div>
                {analytics.postBreakdown.length ? analytics.postBreakdown.map((post) => (
                    <article key={post.postId} className="rounded-2xl border bg-card/80 p-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold tracking-tight">{post.title}</h3>
                            <Link href={`/post/${post.slug}`} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold hover:bg-muted/40">
                                Open
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-7">
                            <p>Views: <span className="font-semibold">{post.views}</span></p>
                            <p>Likes: <span className="font-semibold">{post.likes}</span></p>
                            <p>Dislikes: <span className="font-semibold">{post.dislikes}</span></p>
                            <p>Comments: <span className="font-semibold">{post.comments}</span></p>
                            <p>Bookmarks: <span className="font-semibold">{post.bookmarks}</span></p>
                            <p>Shares: <span className="font-semibold">{post.shares}</span></p>
                            <p>Subscribers: <span className="font-semibold">{post.subscribers}</span></p>
                        </div>
                    </article>
                )) : (
                    <p className="rounded-2xl border p-4 text-muted-foreground">No posts yet, so analytics is empty.</p>
                )}
            </section>
        </main>
    );
}

export default AnalyticsPage;
