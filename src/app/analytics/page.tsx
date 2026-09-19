import { auth } from "@/lib/auth";
import AnalyticsCharts from "@/components/analytics/analytics-charts";
import { getAuthorAnalytics } from "@/lib/db/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Calendar,
  Eye,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track post performance, engagement, and audience growth on VELO.",
};

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

  const primaryStats = [
    {
      label: "Total Views",
      value: summary.totalViews.toLocaleString(),
      helper: "Content impressions",
      icon: Eye,
    },
    {
      label: "Unique Visitors",
      value: summary.uniqueVisitors.toLocaleString(),
      helper: `${summary.returningVisitors} returning readers`,
      icon: Users,
    },
    {
      label: "Subscribers",
      value: summary.totalSubscribers.toLocaleString(),
      helper: "Audience followers",
      icon: TrendingUp,
    },
    {
      label: "Avg Read Time",
      value: `${summary.avgSessionDuration}s`,
      helper: "Reading engagement",
      icon: Calendar,
    },
  ];

  const secondaryStats = [
    { label: "Likes", value: summary.totalLikes, helper: `${likeRatio}% like rate`, icon: ThumbsUp },
    { label: "Comments", value: summary.totalComments, helper: "Discussions", icon: MessageCircle },
    { label: "Bookmarks", value: summary.totalBookmarks, helper: "Saved for reference", icon: Bookmark },
    { label: "Shares", value: summary.totalShares, helper: "External distribution", icon: Share2 },
    { label: "Dislikes", value: summary.totalDislikes, helper: "Feedback", icon: ThumbsDown },
    { label: "Total Articles", value: summary.totalPosts, helper: `${engagementRate}% engagement`, icon: BarChart3 },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      {/* Header Banner */}
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span>Studio Analytics</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Performance & Reach
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Real metrics on your published articles, reader engagement, and subscriber growth.
            </p>
          </div>

          <Link
            href="/post/create"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 self-start md:self-auto"
          >
            Create post
          </Link>
        </div>

        {/* Filter Toolbar */}
        <form
          className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 sm:grid-cols-2 lg:grid-cols-5"
          action="/analytics"
          method="get"
        >
          <select
            name="period"
            defaultValue={period}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-hidden"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <input
            name="from"
            type="date"
            defaultValue={from}
            aria-label="Start date"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
          <input
            name="to"
            type="date"
            defaultValue={to}
            aria-label="End date"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
          <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground cursor-pointer">
            <input type="checkbox" name="compare" value="1" defaultChecked={compare} className="rounded" />
            <span>Compare prior</span>
          </label>
          <button
            type="submit"
            className="h-10 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Apply Filters
          </button>
        </form>

        {analytics.comparison ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Period comparison: views {analytics.comparison.deltas.totalViews}% | likes {analytics.comparison.deltas.totalLikes}% | comments {analytics.comparison.deltas.totalComments}%
          </p>
        ) : null}
      </section>

      {/* Primary Key Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryStats.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border/70 bg-card/75 p-5 shadow-xs transition-all hover:border-foreground/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
          </div>
        ))}
      </section>

      {/* Secondary Engagement Metrics Grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/60 bg-card/50 p-4 transition hover:bg-card/80"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{stat.label}</span>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{stat.helper}</p>
          </div>
        ))}
      </section>

      {/* Charts Visualization */}
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">View & Traffic Trends</h2>
          <p className="text-xs text-muted-foreground">Historical distribution across your published articles</p>
        </div>
        <AnalyticsCharts data={analytics.postBreakdown} />
      </section>

      {/* Content Breakdown List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Article Breakdown</h2>
          <span className="text-xs text-muted-foreground font-mono">{analytics.postBreakdown.length} items</span>
        </div>

        {analytics.postBreakdown.length ? (
          <div className="space-y-3">
            {analytics.postBreakdown.map((post) => (
              <article
                key={post.postId}
                className="rounded-2xl border border-border/70 bg-card/75 p-5 transition hover:border-foreground/20"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="text-base font-bold text-foreground">{post.title}</h3>
                  <Link
                    href={`/post/${post.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold transition hover:bg-muted self-start sm:self-auto"
                  >
                    <span>View</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-3 text-xs sm:grid-cols-4 lg:grid-cols-7">
                  <div>
                    <span className="text-muted-foreground">Views:</span>{" "}
                    <span className="font-semibold text-foreground">{post.views}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Likes:</span>{" "}
                    <span className="font-semibold text-foreground">{post.likes}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Comments:</span>{" "}
                    <span className="font-semibold text-foreground">{post.comments}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bookmarks:</span>{" "}
                    <span className="font-semibold text-foreground">{post.bookmarks}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shares:</span>{" "}
                    <span className="font-semibold text-foreground">{post.shares}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subscribers:</span>{" "}
                    <span className="font-semibold text-foreground">{post.subscribers}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dislikes:</span>{" "}
                    <span className="font-semibold text-foreground">{post.dislikes}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No published posts yet. Create your first post to start accumulating analytics.
          </div>
        )}
      </section>
    </main>
  );
}

export default AnalyticsPage;
