import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postViews } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const postId = Number(body?.postId);
        const durationSeconds = Number(body?.durationSeconds ?? 0);
        const sessionKeyRaw = String(body?.sessionKey ?? "").trim();

        if (!Number.isInteger(postId) || postId <= 0) {
            return NextResponse.json({ message: "Invalid post id" }, { status: 400 });
        }

        const headerStore = await headers();
        const session = await auth.api.getSession({ headers: headerStore });

        const ipAddress = headerStore.get("x-forwarded-for") ?? undefined;
        const sessionId = sessionKeyRaw || headerStore.get("x-vercel-id") || undefined;
        const safeDuration = Number.isFinite(durationSeconds) && durationSeconds > 0
            ? Math.floor(durationSeconds)
            : 0;

        const existing = sessionId
            ? (await db
                .select()
                .from(postViews)
                .where(and(eq(postViews.postId, postId), eq(postViews.sessionId, sessionId)))
                .orderBy(desc(postViews.createdAt))
                .limit(1))[0]
            : undefined;

        if (existing) {
            await db
                .update(postViews)
                .set({
                    durationSeconds: Math.max(existing.durationSeconds ?? 0, safeDuration),
                })
                .where(eq(postViews.id, existing.id));
        } else {
            await db.insert(postViews).values({
                postId,
                userId: session?.user?.id,
                sessionId,
                ipAddress,
                durationSeconds: safeDuration,
            });
        }

        revalidatePath("/analytics");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
