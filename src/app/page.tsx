import PostList from "@/components/post/post-list";
import { auth } from "@/lib/auth";
import { getAllPosts, getSmartRecommendations, getSubscribedAuthorNotifications, getSuggestedPostsFromSubscribedAuthors } from "@/lib/db/queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover projects, stories, and practical ideas from creators across different fields.",
  keywords: [
    "projects",
    "creator stories",
    "community blog",
    "ideas",
    "tutorials",
    "portfolio posts",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VELO | Discover Projects and Stories",
    description: "Explore posts from creators and share your own project journey with the VELO community.",
    url: "/",
    images: ["/VELO_logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELO | Discover Projects and Stories",
    description: "Explore posts from creators and share your own project journey.",
    images: ["/VELO_logo.png"],
  },
};

export default async function Home() {

  const session = await auth.api.getSession({ headers: await headers() });
  const posts = await getAllPosts(session?.user?.id);
  const [suggestedPosts, notificationPosts, smartRecommendations] = session?.user?.id
    ? await Promise.all([
        getSuggestedPostsFromSubscribedAuthors(session.user.id),
        getSubscribedAuthorNotifications(session.user.id),
        getSmartRecommendations(session.user.id),
      ])
    : [[], [], await getSmartRecommendations(undefined)];
  
  return (
    <main className="relative py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(2,132,199,0.12),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.12),transparent_30%)]" />
      <div className="mx-auto max-w-7xl px-4">
        <section className="mb-10 rounded-3xl border bg-card/75 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Fresh stories and tutorials
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            Build better with thoughtful posts on VELO.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Practical notes from real implementation work. Browse the latest posts or publish your own.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/post/create" className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Create post
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-semibold transition hover:border-foreground/20">
              Search posts
            </Link>
            <Link href="/following" className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-semibold transition hover:border-foreground/20">
              Followed feed
            </Link>
          </div>
        </section>

        {
          posts.length === 0?
          <div className="rounded-2xl border bg-card py-14 text-center">
            <h2 className="text-xl font-medium">No Posts Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create your first post to get started.</p>
          </div> : <PostList posts={posts}/>
        }

        {notificationPosts.length ? (
          <section className="mt-10 rounded-2xl border bg-card/70 p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">New From Authors You Follow</h2>
              <Link href="/notifications" className="text-sm font-semibold text-primary">View all</Link>
            </div>
            <ul className="space-y-2 text-sm">
              {notificationPosts.slice(0, 5).map((post) => (
                <li key={post.id} className="rounded-md border p-3">
                  <Link href={`/post/${post.slug}`} className="font-semibold hover:underline">{post.title}</Link>
                  <p className="text-xs text-muted-foreground">by {post.author.name}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {suggestedPosts.length ? (
          <section className="mt-10 rounded-2xl border bg-card/70 p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Suggested From Subscribed Authors</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {suggestedPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.slug}`} className="rounded-md border p-3 transition hover:bg-muted/30">
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.author.name}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {smartRecommendations.length ? (
          <section className="mt-10 rounded-2xl border bg-card/70 p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Smart Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {smartRecommendations.map((post) => (
                <Link key={post.id} href={`/post/${post.slug}`} className="rounded-md border p-3 transition hover:bg-muted/30">
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.author.name}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

