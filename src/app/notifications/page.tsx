import { auth } from "@/lib/auth";
import { getSubscribedAuthorNotifications } from "@/lib/db/queries";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function NotificationsPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const notifications = await getSubscribedAuthorNotifications(session.user.id);

    return (
        <main className="py-10">
            <section className="mb-6 rounded-2xl border bg-card/70 p-6">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="mt-1 text-sm text-muted-foreground">Latest posts from authors you subscribed to with notifications enabled.</p>
            </section>

            {notifications.length ? (
                <div className="space-y-3">
                    {notifications.map((post) => (
                        <article key={post.id} className="rounded-xl border p-4">
                            <Link href={`/post/${post.slug}`} className="text-lg font-semibold hover:underline">{post.title}</Link>
                            <p className="text-sm text-muted-foreground">by {post.author.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border p-6 text-muted-foreground">No new notifications yet. Subscribe to authors and keep notifications on.</div>
            )}
        </main>
    );
}

export default NotificationsPage;
