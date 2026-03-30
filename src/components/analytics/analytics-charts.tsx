"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface AnalyticsChartItem {
    postId: number;
    title: string;
    slug: string;
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    bookmarks: number;
    shares: number;
    subscribers: number;
}

interface AnalyticsChartsProps {
    data: AnalyticsChartItem[];
}

function toSafeNumber(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

const PIE_COLORS = ["#0ea5e9", "#10b981", "#f97316", "#ef4444", "#8b5cf6", "#14b8a6"];

const SERIES_COLORS = {
    views: "#38bdf8",
    likes: "#22c55e",
    comments: "#f59e0b",
    shares: "#d946ef",
    subscribers: "#a78bfa",
};

function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    const normalizedData = data.map((item) => ({
        ...item,
        views: toSafeNumber(item.views),
        likes: toSafeNumber(item.likes),
        dislikes: toSafeNumber(item.dislikes),
        comments: toSafeNumber(item.comments),
        bookmarks: toSafeNumber(item.bookmarks),
        shares: toSafeNumber(item.shares),
        subscribers: toSafeNumber(item.subscribers),
    }));

    const ordered = [...normalizedData].sort((a, b) => b.views - a.views);
    const topFive = ordered.slice(0, 5).map((item) => ({
        ...item,
        shortTitle: item.title.length > 22 ? `${item.title.slice(0, 22)}...` : item.title,
        engagement: item.likes + item.comments + item.bookmarks + item.shares,
    }));

    const topEight = ordered.slice(0, 8).map((item) => ({
        ...item,
        shortTitle: item.title.length > 22 ? `${item.title.slice(0, 22)}...` : item.title,
        engagement: item.likes + item.comments + item.bookmarks + item.shares,
        engagementRate: item.views > 0
            ? Number((((item.likes + item.comments + item.bookmarks + item.shares) / item.views) * 100).toFixed(1))
            : 0,
    }));

    const trendSeries = ordered.slice(0, 10).reverse().map((item, index) => ({
        name: `P${index + 1}`,
        title: item.title,
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
        subscribers: item.subscribers,
    }));

    const conversionSeries = topFive.map((item) => ({
        name: item.shortTitle,
        views: item.views,
        subscribers: item.subscribers,
        conversionRate: item.views > 0 ? Number(((item.subscribers / item.views) * 100).toFixed(2)) : 0,
    }));

    const sentimentSeries = topEight.map((item) => ({
        name: item.shortTitle,
        likes: item.likes,
        dislikes: item.dislikes,
        comments: item.comments,
    }));

    const scatterSeries = topEight.map((item) => ({
        title: item.title,
        x: item.views,
        y: item.engagement,
        z: Math.max(6, item.comments + item.shares),
    }));

    const qualitySeries = topEight.map((item) => ({
        name: item.shortTitle,
        views: item.views,
        qualityScore: Number((item.likes * 2 + item.comments * 2 + item.bookmarks * 1.5 + item.shares * 3 - item.dislikes * 2).toFixed(1)),
    }));

    const topByViews = [...topEight].sort((a, b) => b.views - a.views)[0];
    const topByEngagementRate = [...topEight].sort((a, b) => b.engagementRate - a.engagementRate)[0];
    const topByQuality = [...qualitySeries].sort((a, b) => b.qualityScore - a.qualityScore)[0];
    const maxViews = Math.max(1, ...(topEight.map((item) => item.views)));
    const maxRate = Math.max(1, ...(topEight.map((item) => item.engagementRate)));
    const maxQuality = Math.max(1, ...(qualitySeries.map((item) => item.qualityScore)));

    const trendAxisMax = Math.max(
        1,
        ...trendSeries.map((item) => Math.max(item.views, item.likes, item.comments))
    );

    const topContentAxisMax = Math.max(
        1,
        ...topFive.map((item) => Math.max(item.views, item.engagement))
    );

    const conversionSubscribersMax = Math.max(1, ...conversionSeries.map((item) => item.subscribers));
    const conversionRateMax = Math.max(1, ...conversionSeries.map((item) => item.conversionRate));
    const sentimentAxisMax = Math.max(1, ...sentimentSeries.map((item) => Math.max(item.likes, item.comments, item.dislikes)));
    const efficiencyAxisMax = Math.max(1, ...topEight.map((item) => item.engagementRate));
    const qualityAxisMax = Math.max(1, ...qualitySeries.map((item) => Math.max(item.views, Math.max(0, item.qualityScore))));

    const engagementPie = [
        {
            name: "Likes",
            value: normalizedData.reduce((acc, item) => acc + item.likes, 0),
        },
        {
            name: "Dislikes",
            value: normalizedData.reduce((acc, item) => acc + item.dislikes, 0),
        },
        {
            name: "Comments",
            value: normalizedData.reduce((acc, item) => acc + item.comments, 0),
        },
        {
            name: "Bookmarks",
            value: normalizedData.reduce((acc, item) => acc + item.bookmarks, 0),
        },
        {
            name: "Shares",
            value: normalizedData.reduce((acc, item) => acc + item.shares, 0),
        },
        {
            name: "Subscribers",
            value: normalizedData.reduce((acc, item) => acc + item.subscribers, 0),
        },
    ].filter((item) => item.value > 0);

    return (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Channel Trend</h2>
                <p className="mb-4 text-xs text-muted-foreground">Views and engagement movement across your top content.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendSeries} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, trendAxisMax]} />
                            <Tooltip labelFormatter={(label, payload) => payload?.[0]?.payload?.title ?? label} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Line type="monotone" dataKey="views" stroke={SERIES_COLORS.views} strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="likes" stroke={SERIES_COLORS.likes} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="comments" stroke={SERIES_COLORS.comments} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Content by Views</h2>
                <p className="mb-4 text-xs text-muted-foreground">The strongest posts and how much engagement they generated.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topFive} margin={{ top: 10, right: 10, left: -12, bottom: 34 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="shortTitle" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, topContentAxisMax]} />
                            <Tooltip labelFormatter={(label, payload) => payload?.[0]?.payload?.title ?? label} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="views" fill={SERIES_COLORS.views} radius={[6, 6, 0, 0]} />
                            <Bar dataKey="engagement" fill={SERIES_COLORS.likes} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Engagement Mix</h2>
                <p className="mb-4 text-xs text-muted-foreground">How your audience interacts with your content.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={engagementPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                                {engagementPie.map((entry, index) => (
                                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Subscriber Conversion</h2>
                <p className="mb-4 text-xs text-muted-foreground">Views vs subscriber gains on your top-performing posts.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={conversionSeries} margin={{ top: 10, right: 10, left: -12, bottom: 24 }}>
                            <defs>
                                <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={SERIES_COLORS.subscribers} stopOpacity={0.5} />
                                    <stop offset="95%" stopColor={SERIES_COLORS.subscribers} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, conversionSubscribersMax]} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, conversionRateMax]} />
                            <Tooltip formatter={(value, name) => (name === "conversionRate" ? `${value}%` : value)} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Area yAxisId="left" type="monotone" dataKey="subscribers" stroke={SERIES_COLORS.subscribers} fill="url(#subGradient)" strokeWidth={2.2} />
                            <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke={SERIES_COLORS.shares} strokeWidth={2.2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Engagement Rate Leaderboard</h2>
                <p className="mb-4 text-xs text-muted-foreground">Which posts convert views into interactions most efficiently.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topEight} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, efficiencyAxisMax]} unit="%" />
                            <YAxis type="category" dataKey="shortTitle" tick={{ fontSize: 11 }} width={110} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="engagementRate" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sentiment Balance</h2>
                <p className="mb-4 text-xs text-muted-foreground">Likes, comments, and dislikes distribution per high-performing post.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sentimentSeries} margin={{ top: 10, right: 10, left: -8, bottom: 26 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, sentimentAxisMax]} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="likes" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="comments" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="dislikes" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Views vs Engagement</h2>
                <p className="mb-4 text-xs text-muted-foreground">Bubble map showing which posts overperform for their traffic.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 16, left: -10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis type="number" dataKey="x" name="views" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis type="number" dataKey="y" name="engagement" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [value, name === "x" ? "views" : "engagement"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? "Post"} />
                            <Scatter data={scatterSeries} fill="#38bdf8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Performance Highlights</h2>
                <p className="mb-4 text-xs text-muted-foreground">Quick winners for reach, efficiency, and quality.</p>

                <div className="space-y-4">
                    <div className="rounded-xl border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Highest Reach</p>
                        <p className="mt-1 text-sm font-semibold">{topByViews?.title ?? "No data"}</p>
                        <p className="text-xs text-muted-foreground">{topByViews?.views ?? 0} views</p>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                            <div className="h-full rounded-full bg-sky-500" style={{ width: `${((topByViews?.views ?? 0) / maxViews) * 100}%` }} />
                        </div>
                    </div>

                    <div className="rounded-xl border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Best Engagement Rate</p>
                        <p className="mt-1 text-sm font-semibold">{topByEngagementRate?.title ?? "No data"}</p>
                        <p className="text-xs text-muted-foreground">{topByEngagementRate?.engagementRate ?? 0}% interaction efficiency</p>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${((topByEngagementRate?.engagementRate ?? 0) / maxRate) * 100}%` }} />
                        </div>
                    </div>

                    <div className="rounded-xl border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Top Quality Score</p>
                        <p className="mt-1 text-sm font-semibold">{topByQuality?.name ?? "No data"}</p>
                        <p className="text-xs text-muted-foreground">Score {topByQuality?.qualityScore ?? 0}</p>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${((topByQuality?.qualityScore ?? 0) / maxQuality) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/80 p-4 md:p-5 xl:col-span-2">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quality Score vs Reach</h2>
                <p className="mb-4 text-xs text-muted-foreground">Compares weighted interaction quality against total reach for each post.</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={qualitySeries} margin={{ top: 10, right: 12, left: -10, bottom: 24 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} domain={[0, qualityAxisMax]} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="views" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                            <Line type="monotone" dataKey="qualityScore" stroke="#f97316" strokeWidth={2.2} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}

export default AnalyticsCharts;
