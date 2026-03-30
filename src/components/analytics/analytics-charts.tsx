"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
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
        </section>
    );
}

export default AnalyticsCharts;
