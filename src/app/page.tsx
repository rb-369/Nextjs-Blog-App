import PostList from "@/components/post/post-list";
import { getAllPosts} from "@/lib/db/queries";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "RB's Blog App",
  description: "This a web app created with Next.js"
}

export default async function Home() {

  const posts = await getAllPosts();
  
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
            Build better with thoughtful posts on Next.js, auth, and full-stack workflows.
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
          </div>
        </section>

        {
          posts.length === 0?
          <div className="rounded-2xl border bg-card py-14 text-center">
            <h2 className="text-xl font-medium">No Posts Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create your first post to get started.</p>
          </div> : <PostList posts={posts}/>
        }
      </div>
    </main>
  )
}

