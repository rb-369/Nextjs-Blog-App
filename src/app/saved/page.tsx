import PostCard from "@/components/post/post-card";
import { auth } from "@/lib/auth";
import { getSavedPosts } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function SavedPostsPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const savedPosts = await getSavedPosts(session.user.id);

    return (
        <main className="py-10">
            <section className="mb-8 rounded-xl border bg-card/70 p-6">
                <h1 className="text-3xl font-bold">Saved Posts</h1>
                <p className="mt-1 text-sm text-muted-foreground">All posts you bookmarked for later reading.</p>
            </section>

            {savedPosts.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {savedPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border bg-card/60 p-6 text-muted-foreground">You have no saved posts yet.</div>
            )}
        </main>
    );
}

export default SavedPostsPage;
