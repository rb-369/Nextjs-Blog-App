import PostCard from "@/components/post/post-card"
import { auth } from "@/lib/auth"
import { getYourPosts } from "@/lib/db/queries"
import type { Metadata } from "next";
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "Your Posts | VELO",
    description: "Manage and review all posts authored by you on VELO.",
};


async function YourPosts() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        redirect("/");

    }

    const yourPosts = await getYourPosts(session.user.id);

    const hasPosts = (yourPosts?.length ?? 0) > 0;

    return (
        <section className="mt-10">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="text-3xl font-black tracking-tight">Your Posts</h1>
                <Link href="/post/create" className="rounded-md border-2 border-zinc-500 px-3 py-1.5 text-sm font-semibold transition-colors duration-200 hover:border-foreground/20 dark:border-zinc-200 dark:hover:border-zinc-400">
                    Create New
                </Link>
            </div>

            {!hasPosts ? (
                <div>
                    <Link href="/post/create">
                        <h1 className="rounded-2xl border bg-card p-10 text-center text-2xl font-semibold hover:underline">
                            0 posts found. Click here to create your first post.
                        </h1>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {yourPosts?.map((post) => (
                        <PostCard post={post} key={post.id} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default YourPosts