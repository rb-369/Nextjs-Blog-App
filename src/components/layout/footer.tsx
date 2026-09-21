import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card/40 text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5 font-bold text-foreground">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:border-foreground/20 dark:border-border/60">
                <Image
                  src="/velo_logo_without_bg.svg"
                  alt="VELO logo"
                  width={32}
                  height={32}
                  className="h-7 w-auto"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight">VELO</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A modern publication and knowledge platform for engineers, designers, and builders documenting real implementation work.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span className="font-medium text-foreground">Systems Operational</span>
              <span className="text-muted-foreground/60">·</span>
              <span>Fast Edge Delivery</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Discover
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="transition hover:text-foreground">
                  Explore Stories
                </Link>
              </li>
              <li>
                <Link href="/search?sort=trending" className="transition hover:text-foreground">
                  Trending Posts
                </Link>
              </li>
              <li>
                <Link href="/search?tag=nextjs" className="transition hover:text-foreground">
                  Next.js Guides
                </Link>
              </li>
              <li>
                <Link href="/search?tag=performance" className="transition hover:text-foreground">
                  Performance Notes
                </Link>
              </li>
              <li>
                <Link href="/following" className="transition hover:text-foreground">
                  Followed Feed
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Creator Studio
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/post/create" className="transition hover:text-foreground">
                  Publish New Story
                </Link>
              </li>
              <li>
                <Link href="/yourPosts" className="transition hover:text-foreground">
                  Your Drafts & Posts
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="transition hover:text-foreground">
                  Studio Analytics
                </Link>
              </li>
              <li>
                <Link href="/saved" className="transition hover:text-foreground">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/moderation" className="transition hover:text-foreground">
                  Content Moderation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/search" className="transition hover:text-foreground">
                  Global Search
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="transition hover:text-foreground">
                  Notification Center
                </Link>
              </li>
              <li>
                <Link href="/profile" className="transition hover:text-foreground">
                  Author Profile
                </Link>
              </li>
              <li>
                <Link href="/auth" className="transition hover:text-foreground">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} VELO Publishing Platform. Designed for builder clarity.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Next.js & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
