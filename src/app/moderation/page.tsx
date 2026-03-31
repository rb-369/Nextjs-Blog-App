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

export const metadata: Metadata = {
    title: "Moderation | VELO",
    description: "Review reports, comments, and blocked words to keep your VELO content healthy.",
};

async function ModerationPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect("/auth");
    }

    const dashboard = await getModerationDashboard(session.user.id);

    return (
        <main className="py-10 space-y-8">
            <section className="rounded-2xl border bg-card/70 p-6">
                <h1 className="text-3xl font-bold">Moderation Tools</h1>
                <p className="mt-1 text-sm text-muted-foreground">Review reports, moderate pending comments, and manage block words.</p>
            </section>

            <section className="rounded-2xl border p-5">
                <h2 className="text-xl font-semibold">Blocked Words</h2>
                <form
                    action={async (formData) => {
                        "use server";
                        const word = String(formData.get("word") ?? "");
                        await addAuthorBlockedWord(word);
                    }}
                    className="mt-3 flex flex-wrap gap-2"
                >
                    <input
                        name="word"
                        placeholder="Add blocked word"
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <button type="submit" className="h-10 rounded-md border px-3 text-sm font-semibold">Add</button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    {dashboard.blockedWords.length ? dashboard.blockedWords.map((item) => (
                        <form
                            key={item.id}
                            action={async () => {
                                "use server";
                                await removeAuthorBlockedWord(item.id);
                            }}
                        >
                            <button type="submit" className="rounded-full border px-3 py-1 text-xs hover:bg-muted">
                                {item.word} x
                            </button>
                        </form>
                    )) : (
                        <p className="text-sm text-muted-foreground">No blocked words yet.</p>
                    )}
                </div>
            </section>

            <section className="rounded-2xl border p-5">
                <h2 className="text-xl font-semibold">Pending Comments</h2>
                <div className="mt-4 space-y-3">
                    {dashboard.commentsQueue.length ? dashboard.commentsQueue.map((item) => (
                        <article key={item.id} className="rounded-xl border p-4">
                            <Link href={`/post/${item.post.slug}`} className="text-sm font-semibold hover:underline">{item.post.title}</Link>
                            <p className="mt-1 text-sm">{item.user?.name ?? "Unknown"}: {item.content}</p>
                            <div className="mt-3 flex gap-2">
                                <form
                                    action={async () => {
                                        "use server";
                                        await moderateComment(item.id, "approved");
                                    }}
                                >
                                    <button type="submit" className="rounded-md border px-3 py-1 text-xs font-semibold">Approve</button>
                                </form>
                                <form
                                    action={async () => {
                                        "use server";
                                        await moderateComment(item.id, "rejected");
                                    }}
                                >
                                    <button type="submit" className="rounded-md border px-3 py-1 text-xs font-semibold">Reject</button>
                                </form>
                            </div>
                        </article>
                    )) : (
                        <p className="text-sm text-muted-foreground">No pending comments.</p>
                    )}
                </div>
            </section>

            <section className="rounded-2xl border p-5">
                <h2 className="text-xl font-semibold">Open Reports</h2>
                <div className="mt-4 space-y-3">
                    {dashboard.reports.length ? dashboard.reports.map((item) => (
                        <article key={item.id} className="rounded-xl border p-4">
                            <Link href={`/post/${item.post.slug}`} className="text-sm font-semibold hover:underline">{item.post.title}</Link>
                            <p className="mt-1 text-sm">Reported by {item.user?.name ?? "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">Reason: {item.reason}</p>
                            <div className="mt-3 flex gap-2">
                                <form
                                    action={async () => {
                                        "use server";
                                        await reviewPostReport(item.id, "reviewed");
                                    }}
                                >
                                    <button type="submit" className="rounded-md border px-3 py-1 text-xs font-semibold">Mark Reviewed</button>
                                </form>
                                <form
                                    action={async () => {
                                        "use server";
                                        await reviewPostReport(item.id, "open");
                                    }}
                                >
                                    <button type="submit" className="rounded-md border px-3 py-1 text-xs font-semibold">Reopen</button>
                                </form>
                            </div>
                        </article>
                    )) : (
                        <p className="text-sm text-muted-foreground">No open reports.</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default ModerationPage;
