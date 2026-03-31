import PostCard from "@/components/post/post-card";
import { getPostsByTag } from "@/lib/db/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    return {
        title: `#${decodedName} | VELO`,
        description: `Browse posts tagged ${decodedName} on VELO.`,
    };
}

async function TagPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const { tag, posts } = await getPostsByTag(name);

    if (!tag) {
        notFound();
    }

    return (
        <main className="py-10">
            <section className="mb-8 rounded-xl border bg-card/60 p-6">
                <p className="text-sm text-muted-foreground">Tag discovery</p>
                <h1 className="text-3xl font-bold">#{tag.name}</h1>
                <p className="text-muted-foreground">{posts.length} post{posts.length === 1 ? "" : "s"} in this tag</p>
            </section>

            {posts.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border bg-card/50 p-6 text-muted-foreground">No posts in this tag yet.</div>
            )}
        </main>
    );
}

export default TagPage;
