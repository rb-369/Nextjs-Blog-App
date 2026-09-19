import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Error 404
      </span>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The article, topic, or profile you requested may have been moved or is no longer published.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-xl font-semibold shadow-xs">
          <Link href="/">
            <Compass className="h-4 w-4 mr-1.5" />
            Explore Stories
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl font-semibold">
          <Link href="/search">
            <Search className="h-4 w-4 mr-1.5" />
            Search Archive
          </Link>
        </Button>
      </div>
    </main>
  );
}