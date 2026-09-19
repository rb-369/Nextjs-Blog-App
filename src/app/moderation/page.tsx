import {
  addAuthorBlockedWord,
  moderateComment,
  removeAuthorBlockedWord,
  reviewPostReport,
} from "@/actions/social-actions";
import { auth } from "@/lib/auth";
import { getModerationDashboard } from "@/lib/db/queries";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Flag, MessageSquare, ShieldAlert, ShieldCheck, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Moderation",
  description: "Review reports, comments, and blocked words to keep your VELO content healthy.",
};

async function ModerationPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const dashboard = await getModerationDashboard(session.user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-8">
      {/* Header Banner */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Trust & Safety Hub</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Content Moderation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Protect your articles and community conversations with custom keyword filters and report reviews.
        </p>
      </section>

      {/* 1. Blocked Words Filter */}
      <section className="rounded-2xl border border-border/70 bg-card/75 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Author Blocked Keywords</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Comments containing any of these words will be held in queue for your approval.
        </p>

        <form
          action={async (formData) => {
            "use server";
            const word = String(formData.get("word") ?? "");
            await addAuthorBlockedWord(word);
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            name="word"
            placeholder="Add keyword or phrase"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-hidden"
          />
          <button
            type="submit"
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Add Keyword
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {dashboard.blockedWords.length ? (
            dashboard.blockedWords.map((item) => (
              <form
                key={item.id}
                action={async () => {
                  "use server";
                  await removeAuthorBlockedWord(item.id);
                }}
              >
                <button
                  type="submit"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <span>{item.word}</span>
                  <X className="h-3 w-3 transition group-hover:scale-110" />
                </button>
              </form>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No blocked words configured.</p>
          )}
        </div>
      </section>

      {/* 2. Pending Comments Queue */}
      <section className="rounded-2xl border border-border/70 bg-card/75 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Pending Comments Queue</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {dashboard.commentsQueue.length} pending
          </span>
        </div>

        <div className="space-y-3">
          {dashboard.commentsQueue.length ? (
            dashboard.commentsQueue.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border/60 bg-background/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {item.user?.name ?? "Anonymous Reader"}
                  </span>
                  <Link href={`/post/${item.post.slug}`} className="text-primary hover:underline">
                    In: {item.post.title}
                  </Link>
                </div>

                <p className="text-sm text-foreground/90 bg-muted/30 rounded-lg p-3 border border-border/50">
                  {item.content}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <form
                    action={async () => {
                      "use server";
                      await moderateComment(item.id, "approved");
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moderateComment(item.id, "rejected");
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Queue clear. No pending comments require approval.
            </div>
          )}
        </div>
      </section>

      {/* 3. Open Reports Queue */}
      <section className="rounded-2xl border border-border/70 bg-card/75 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Flagged Content Reports</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {dashboard.reports.length} open
          </span>
        </div>

        <div className="space-y-3">
          {dashboard.reports.length ? (
            dashboard.reports.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border/60 bg-background/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Link href={`/post/${item.post.slug}`} className="font-semibold text-foreground hover:underline">
                    {item.post.title}
                  </Link>
                  <span>Reported by {item.user?.name ?? "Reader"}</span>
                </div>

                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400">
                  <span className="font-semibold">Reason:</span> {item.reason}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <form
                    action={async () => {
                      "use server";
                      await reviewPostReport(item.id, "reviewed");
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                    >
                      Mark Reviewed
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              All clear. No open content reports.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ModerationPage;
