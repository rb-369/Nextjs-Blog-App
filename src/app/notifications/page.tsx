import { auth } from "@/lib/auth";
import NotificationPreferencesForm from "@/components/notifications/notification-preferences-form";
import { getNotificationCenter } from "@/lib/db/queries";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Bell, MessageSquare, Reply, Rss } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications",
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
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-8">
      {/* Header Banner */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Bell className="h-3.5 w-3.5 text-primary" />
          <span>Activity Center</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Notifications & Signals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track discussions on your posts, responses to your comments, and updates from creators you follow.
        </p>

        {/* Granular Preferences Box */}
        <div className="mt-6 border-t border-border/60 pt-6">
          <NotificationPreferencesForm
            initialValues={{
              notifyCommentsOnMyPosts: center.preferences.notifyCommentsOnMyPosts,
              notifyNewPostsFromFollowedAuthors: center.preferences.notifyNewPostsFromFollowedAuthors,
              notifyRepliesToMyComments: center.preferences.notifyRepliesToMyComments,
            }}
          />
        </div>
      </section>

      {/* 1. New Posts From Followed Creators */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Rss className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            From Followed Creators
          </h2>
        </div>

        {followedPosts.length ? (
          <div className="space-y-3">
            {followedPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-border/70 bg-card/75 p-5 transition hover:border-foreground/25"
              >
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-base font-bold text-foreground hover:text-primary transition"
                  >
                    {post.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    by {post.author.name}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground bg-card/30">
            No new posts from authors you follow at this moment.
          </div>
        )}
      </section>

      {/* 2. Comments On My Posts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Comments on Your Articles
          </h2>
        </div>

        {commentsOnMyPosts.length ? (
          <div className="space-y-3">
            {commentsOnMyPosts.map((item) => (
              <article
                key={item.commentId}
                className="rounded-2xl border border-border/70 bg-card/75 p-5 transition hover:border-foreground/25"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">{item.commenterName}</span>
                  <Link href={`/post/${item.postSlug}`} className="hover:underline text-primary">
                    View in {item.postTitle}
                  </Link>
                </div>
                <p className="text-sm text-foreground/90 bg-muted/30 rounded-xl p-3 border border-border/50">
                  {item.content}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground bg-card/30">
            No new comments on your published posts yet.
          </div>
        )}
      </section>

      {/* 3. Replies To My Comments */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Reply className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Replies to Your Comments
          </h2>
        </div>

        {repliesToMyComments.length ? (
          <div className="space-y-3">
            {repliesToMyComments.map((item) => (
              <article
                key={item.commentId}
                className="rounded-2xl border border-border/70 bg-card/75 p-5 transition hover:border-foreground/25"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">{item.commenterName} replied</span>
                  <Link href={`/post/${item.postSlug}`} className="hover:underline text-primary">
                    View in {item.postTitle}
                  </Link>
                </div>
                <p className="text-sm text-foreground/90 bg-muted/30 rounded-xl p-3 border border-border/50">
                  {item.content}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground bg-card/30">
            No new replies to your comments.
          </div>
        )}
      </section>
    </main>
  );
}

export default NotificationsPage;
