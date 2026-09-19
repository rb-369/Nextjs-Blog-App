function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/70 ${className}`.trim()} />;
}

export function PageLoadingSkeleton({
  title = "Loading VELO...",
  subtitle = "Fetching content for you",
  cards = 6,
}: {
  title?: string;
  subtitle?: string;
  cards?: number;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-8">
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 md:p-8 backdrop-blur-md">
        <SkeletonLine className="mb-4 h-4 w-32" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-5 flex gap-3">
          <SkeletonLine className="h-10 w-28" />
          <SkeletonLine className="h-10 w-28" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <article key={index} className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-3">
            <SkeletonLine className="h-40 w-full rounded-xl" />
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="h-6 w-full" />
            <SkeletonLine className="h-4 w-4/5" />
          </article>
        ))}
      </section>
    </main>
  );
}
