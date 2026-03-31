function SkeletonLine({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-muted ${className}`.trim()} />;
}

export function PageLoadingSkeleton({
    title = "Loading...",
    subtitle = "Fetching content for you",
    cards = 6,
}: {
    title?: string;
    subtitle?: string;
    cards?: number;
}) {
    return (
        <main className="relative py-10 md:py-14">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(2,132,199,0.10),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.10),transparent_30%)]" />
            <div className="mx-auto max-w-7xl px-4">
                <section className="mb-8 rounded-3xl border bg-card/70 p-6 shadow-sm backdrop-blur md:p-8">
                    <SkeletonLine className="mb-4 h-4 w-40" />
                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
                    <div className="mt-5 flex gap-3">
                        <SkeletonLine className="h-10 w-32" />
                        <SkeletonLine className="h-10 w-32" />
                        <SkeletonLine className="h-10 w-32" />
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: cards }).map((_, index) => (
                        <article key={index} className="rounded-2xl border bg-card/70 p-5">
                            <SkeletonLine className="h-4 w-24" />
                            <SkeletonLine className="mt-3 h-6 w-full" />
                            <SkeletonLine className="mt-2 h-4 w-4/5" />
                            <SkeletonLine className="mt-5 h-4 w-28" />
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}
