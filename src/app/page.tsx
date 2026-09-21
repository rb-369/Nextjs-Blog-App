import PostList from "@/components/post/post-list";
import DoubleClickPostWrapper from "@/components/post/double-click-post-wrapper";
import { auth } from "@/lib/auth";
import {
  getAllPosts,
  getSubscribedAuthorNotifications,
} from "@/lib/db/queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Compass,
  FileCode2,
  PenSquare,
  Sparkles,
  Users2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "VELO | Share Projects, Stories, and Ideas",
  description: "Discover projects, engineering stories, and practical tutorials from builders across the globe.",
  keywords: [
    "software engineering blog",
    "developer notes",
    "creator stories",
    "tutorials",
    "system architecture",
    "web development",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VELO | Discover Projects and Stories",
    description: "Explore posts from creators and share your own engineering journey with the VELO community.",
    url: "/",
    images: ["/velo_hero_art.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELO | Discover Projects and Stories",
    description: "Explore posts from creators and share your own project journey.",
    images: ["/velo_hero_art.jpg"],
  },
};

const TOPIC_PILLS = [
  { label: "All Stories", href: "/" },
  { label: "Web Development", href: "/search?q=Web%20Development" },
  { label: "Next.js", href: "/search?tag=nextjs" },
  { label: "UI & Design", href: "/search?q=UI/UX" },
  { label: "Performance", href: "/search?tag=performance" },
  { label: "Database", href: "/search?tag=postgres" },
  { label: "Architecture", href: "/search?q=architecture" },
];

export default async function Home() {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (err) {
    console.error("Failed to load session in Home:", err);
  }

  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts(session?.user?.id);
  } catch (err) {
    console.error("Failed to load posts in Home:", err);
  }

  let notificationPosts: Awaited<ReturnType<typeof getSubscribedAuthorNotifications>> = [];

  try {
    if (session?.user?.id) {
      notificationPosts = await getSubscribedAuthorNotifications(session.user.id).catch(() => []);
    }
  } catch (err) {
    console.error("Failed to load notifications in Home:", err);
  }

  const featuredPost = posts[0] || null;
  const secondaryPosts = posts.slice(1, 3);
  const remainingPosts = posts.slice(3);

  return (
    <main className="relative overflow-hidden">
      {/* Background Ambient Gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),rgba(14,165,233,0.05),transparent_70%)] blur-3xl" />

      {/* 1. HERO SECTION (Fits initial viewport, max 2 line headline, max 20 word subtext) */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Hero Left Content */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Independent Engineering Publication</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1] text-foreground text-balance">
              Where builders document what actually works.
            </h1>

            <p className="max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
              Field notes, architecture deep-dives, and tutorials from makers sharing authentic lessons in software and design craft.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="#feed"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md cursor-pointer"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Stories</span>
              </Link>
              <Link
                href="/post/create"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-foreground/30 hover:bg-card cursor-pointer"
              >
                <PenSquare className="h-4 w-4 text-muted-foreground" />
                <span>Start Writing</span>
              </Link>
            </div>
          </div>

          {/* Hero Right Visual: Generated Architectural Art */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/80 bg-card/50 shadow-2xl">
              <Image
                src="/velo_hero_art.jpg"
                alt="VELO abstract architectural composition"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-background/70 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-foreground">VELO Dispatch</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">Curated Feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. COMMUNITY PROOF STRIP (Under Hero) */}
        <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 md:grid-cols-4 md:p-6 backdrop-blur-xs">
          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{posts.length}+</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Dispatches</p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">100%</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Open Access</p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">Studio</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Analytics</p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">Zero Ads</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">No Paywalls</p>
          </div>
        </div>
      </section>

      {/* 3. SPOTLIGHT BENTO GRID */}
      {featuredPost && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Spotlight</h2>
              <p className="text-sm text-muted-foreground">Handpicked deep-dives and engineering breakthroughs</p>
            </div>
            <Link href="/search?sort=trending" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              <span>View trending</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Primary Featured Card (Span 7) */}
            <div className="md:col-span-7">
              <DoubleClickPostWrapper
                slug={featuredPost.slug}
                postId={featuredPost.id}
                className="h-full"
              >
                <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg cursor-pointer select-none">
                  <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={featuredPost.coverImage || "/velo_craft_art.jpg"}
                      alt={featuredPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {featuredPost.category}
                      </span>
                      <span className="text-xs text-muted-foreground">Editor choice</span>
                    </div>

                    <Link href={`/post/${featuredPost.slug}`}>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition text-balance">
                        {featuredPost.title}
                      </h3>
                    </Link>

                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {featuredPost.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border/50">
                      <span>By {featuredPost.author?.name || "Anonymous"}</span>
                      <Link
                        href={`/post/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Read article
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              </DoubleClickPostWrapper>
            </div>

            {/* Secondary Tiles (Span 5) */}
            <div className="flex flex-col gap-6 md:col-span-5">
              {secondaryPosts.length > 0 ? (
                secondaryPosts.map((post) => (
                  <DoubleClickPostWrapper
                    key={post.id}
                    slug={post.slug}
                    postId={post.id}
                    className="flex flex-1"
                  >
                    <article className="group flex w-full flex-1 flex-col justify-between rounded-3xl border border-border/70 bg-card/80 p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg cursor-pointer select-none">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="rounded-full border border-border/80 bg-background/80 px-2 py-0.5 font-semibold text-muted-foreground">
                            {post.category}
                          </span>
                          <span className="text-muted-foreground font-mono text-[11px]">Recommended</span>
                        </div>

                        <Link href={`/post/${post.slug}`}>
                          <h4 className="text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition">
                            {post.title}
                          </h4>
                        </Link>

                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {post.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 text-xs text-muted-foreground border-t border-border/50">
                        <span>{post.author?.name || "Author"}</span>
                        <Link
                          href={`/post/${post.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          Read
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  </DoubleClickPostWrapper>
                ))
              ) : (
                <div className="flex flex-1 flex-col justify-center rounded-3xl border border-dashed border-border p-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold">More stories appearing soon</p>
                  <p className="mt-1 text-xs text-muted-foreground">Publish yours to see it spotlighted here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. TOPIC FILTER RIBBON */}
      <section className="border-y border-border/60 bg-muted/20 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 scrollbar-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pr-2 shrink-0">
            Topics:
          </span>
          {TOPIC_PILLS.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className="rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground shrink-0"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 5. FOLLOWING & NOTIFICATIONS NOTICES (If Logged In) */}
      {notificationPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">New From Authors You Follow</h3>
              <Link href="/notifications" className="text-xs font-semibold text-primary hover:underline">
                View all alerts
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {notificationPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="rounded-xl border border-border/60 bg-background/80 p-3.5 transition hover:border-foreground/20 hover:bg-muted/40"
                >
                  <p className="font-semibold text-sm line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {post.author?.name || "Author"}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. MAIN DISCOVER FEED */}
      <section id="feed" className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Latest Publications</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fresh dispatches, tutorials, and field journals</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
            >
              Search all
            </Link>
            <Link
              href="/post/create"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Publish post
            </Link>
          </div>
        </div>

        {/* Post Grid */}
        <PostList posts={featuredPost ? (remainingPosts.length > 0 ? remainingPosts : posts) : posts} />
      </section>

      {/* 7. "WHY WRITE ON VELO" VALUE PROPOSITION (Asymmetric 3-column layout) */}
      <section className="border-t border-border/70 bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
              Designed for the craft of engineering writing.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              VELO removes bloated ads, popups, and paywalls so knowledge can be documented and discovered with clarity.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileCode2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Clean Markdown Syntax</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Write freely with standard markdown, code highlighting, and clean typography that renders effortlessly on any screen.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Actionable Creator Studio</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Track real reader view counts, bookmark traction, and reader discussions without third-party tracking scripts.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Subscriber Connection</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Build an authentic following of developers and readers who get notified whenever you publish your latest work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-8 md:p-12 text-zinc-100 shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="max-w-xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl text-white text-balance">
              Ready to publish your project story?
            </h2>
            <p className="text-sm md:text-base text-zinc-300">
              Join our growing community of engineers, founders, and designers sharing real-world insights.
            </p>
            <div className="pt-2">
              <Link
                href="/post/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                <PenSquare className="h-4 w-4" />
                <span>Start writing today</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
