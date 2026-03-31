import { auth } from "@/lib/auth";
import PostList from "@/components/post/post-list";
import { getFollowedAuthorsFeed } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Following | VELO",
    description: "Catch up on the latest posts from creators you follow on VELO.",
};

async function FollowingFeedPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const feedPosts = await getFollowedAuthorsFeed(session.user.id);

    return (
        <main className="py-10">
            <section className="mb-6 rounded-2xl border bg-card/70 p-6">
                <h1 className="text-3xl font-bold">Followed Authors Feed</h1>
                <p className="mt-1 text-sm text-muted-foreground">Latest published posts from creators you follow.</p>
            </section>

            {feedPosts.length ? (
                <PostList posts={feedPosts} />
            ) : (
                <div className="rounded-2xl border p-6 text-muted-foreground">No posts from followed authors yet.</div>
            )}
        </main>
    );
}

export default FollowingFeedPage;
