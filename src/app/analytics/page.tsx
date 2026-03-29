import { auth } from "@/lib/auth";
import AnalyticsCharts from "@/components/analytics/analytics-charts";
import { getAuthorAnalytics } from "@/lib/db/queries";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function AnalyticsPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const analytics = await getAuthorAnalytics(session.user.id);

    return (
        <main className="py-10">
            <section className="mb-6 rounded-2xl border bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(16,185,129,0.1),rgba(249,115,22,0.1))] p-6">
                <h1 className="text-3xl font-black tracking-tight">Author Analytics Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Track views, engagement, and growth across all your posts.</p>
            </section>

            <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Posts</p><p className="text-2xl font-bold">{analytics.summary.totalPosts}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Views</p><p className="text-2xl font-bold">{analytics.summary.totalViews}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Likes</p><p className="text-2xl font-bold">{analytics.summary.totalLikes}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Dislikes</p><p className="text-2xl font-bold">{analytics.summary.totalDislikes}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Comments</p><p className="text-2xl font-bold">{analytics.summary.totalComments}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Bookmarks</p><p className="text-2xl font-bold">{analytics.summary.totalBookmarks}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Shares</p><p className="text-2xl font-bold">{analytics.summary.totalShares}</p></div>
                <div className="rounded-lg border bg-card/80 p-4"><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-2xl font-bold">{analytics.summary.totalSubscribers}</p></div>
            </section>

            <div className="mb-8">
                <AnalyticsCharts data={analytics.postBreakdown} />
            </div>

            <section className="space-y-4">
                {analytics.postBreakdown.length ? analytics.postBreakdown.map((post) => (
                    <article key={post.postId} className="rounded-lg border bg-card/80 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">{post.title}</h2>
                            <Link href={`/post/${post.slug}`} className="text-sm text-primary underline">Open</Link>
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
                    <p className="rounded-lg border p-4 text-muted-foreground">No posts yet, so analytics is empty.</p>
                )}
            </section>
        </main>
    );
}

export default AnalyticsPage;
