"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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

const PIE_COLORS = ["#0ea5e9", "#10b981", "#f97316", "#ef4444", "#8b5cf6", "#14b8a6"];

function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    const topPosts = data.slice(0, 8);

    const engagementPie = [
        {
            name: "Likes",
            value: data.reduce((acc, item) => acc + item.likes, 0),
        },
        {
            name: "Dislikes",
            value: data.reduce((acc, item) => acc + item.dislikes, 0),
        },
        {
            name: "Comments",
            value: data.reduce((acc, item) => acc + item.comments, 0),
        },
        {
            name: "Bookmarks",
            value: data.reduce((acc, item) => acc + item.bookmarks, 0),
        },
        {
            name: "Shares",
            value: data.reduce((acc, item) => acc + item.shares, 0),
        },
        {
            name: "Subscribers",
            value: data.reduce((acc, item) => acc + item.subscribers, 0),
        },
    ].filter((item) => item.value > 0);

    return (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card/80 p-4">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Posts by Views</h2>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topPosts} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="title"
                                tick={{ fontSize: 11 }}
                                interval={0}
                                angle={-18}
                                textAnchor="end"
                                height={54}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-xl border bg-card/80 p-4">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Engagement Mix</h2>
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
        </section>
    );
}

export default AnalyticsCharts;
