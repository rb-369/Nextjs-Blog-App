import { auth } from "@/lib/auth";
import NotificationPreferencesForm from "@/components/notifications/notification-preferences-form";
import { getNotificationCenter } from "@/lib/db/queries";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notifications | VELO",
    description: "See new likes, comments, and follows from your VELO activity.",
};

async function NotificationsPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const center = await getNotificationCenter(session.user.id);
    const followedPosts = center.followedPosts;
    const commentsOnMyPosts = center.commentsOnMyPosts;
    const repliesToMyComments = center.repliesToMyComments as Array<{
        commentId: number;
        content: string;
        createdAt: string;
        postSlug: string;
        postTitle: string;
        commenterName: string;
    }>;

    return (
        <main className="py-10">
            <section className="mb-6 rounded-2xl border bg-card/70 p-6">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="mt-1 text-sm text-muted-foreground">All your activity signals in one place with granular preferences.</p>
            </section>

            <div className="mb-6">
                <NotificationPreferencesForm
                    initialValues={{
                        notifyCommentsOnMyPosts: center.preferences.notifyCommentsOnMyPosts,
                        notifyNewPostsFromFollowedAuthors: center.preferences.notifyNewPostsFromFollowedAuthors,
                        notifyRepliesToMyComments: center.preferences.notifyRepliesToMyComments,
                    }}
                />
            </div>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">New Posts From Followed Authors</h2>
                {followedPosts.length ? (
                    <div className="space-y-3">
                        {followedPosts.map((post) => (
                            <article key={post.id} className="rounded-xl border p-4">
                                <Link href={`/post/${post.slug}`} className="text-lg font-semibold hover:underline">{post.title}</Link>
                                <p className="text-sm text-muted-foreground">by {post.author.name}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border p-6 text-muted-foreground">No new followed-author posts right now.</div>
                )}
            </section>

            <section className="mt-8 space-y-3">
                <h2 className="text-xl font-semibold">Comments On My Posts</h2>
                {commentsOnMyPosts.length ? (
                    <div className="space-y-3">
                        {commentsOnMyPosts.map((item) => (
                            <article key={item.commentId} className="rounded-xl border p-4">
                                <Link href={`/post/${item.postSlug}`} className="text-sm font-semibold hover:underline">{item.postTitle}</Link>
                                <p className="mt-1 text-sm">{item.commenterName}: {item.content}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border p-6 text-muted-foreground">No new comments on your posts.</div>
                )}
            </section>

            <section className="mt-8 space-y-3">
                <h2 className="text-xl font-semibold">Replies To My Comments</h2>
                {repliesToMyComments.length ? (
                    <div className="space-y-3">
                        {repliesToMyComments.map((item) => (
                            <article key={item.commentId} className="rounded-xl border p-4">
                                <Link href={`/post/${item.postSlug}`} className="text-sm font-semibold hover:underline">{item.postTitle}</Link>
                                <p className="mt-1 text-sm">{item.commenterName}: {item.content}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border p-6 text-muted-foreground">No replies to your comments yet.</div>
                )}
            </section>
        </main>
    );
}

export default NotificationsPage;
