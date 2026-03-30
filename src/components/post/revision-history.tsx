"use client";

import { restorePostRevision } from "@/actions/post-actions";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface RevisionItem {
    id: number;
    title: string;
    createdAt: Date;
}

interface RevisionHistoryProps {
    postId: number;
    revisions: RevisionItem[];
}

function RevisionHistory({ postId, revisions }: RevisionHistoryProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRestore = (revisionId: number) => {
        startTransition(async () => {
            const result = await restorePostRevision(postId, revisionId);

            if (!result.success) {
                toast(result.message ?? "Failed to restore revision");
                return;
            }

            toast("Revision restored");
            router.push(`/post/${result.slug}`);
            router.refresh();
        });
    };

    return (
        <section className="mt-8 rounded-2xl border bg-card/60 p-5">
            <h2 className="text-xl font-semibold">Revision History</h2>
            <p className="mt-1 text-sm text-muted-foreground">Restore older versions of this post.</p>

            <div className="mt-4 space-y-3">
                {revisions.length ? revisions.map((item) => (
                    <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground">Saved {formatDate(item.createdAt)}</p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleRestore(item.id)}
                        >
                            Restore
                        </Button>
                    </article>
                )) : (
                    <p className="text-sm text-muted-foreground">No revisions yet.</p>
                )}
            </div>
        </section>
    );
}

export default RevisionHistory;
