import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postViews } from "@/lib/db/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const postId = Number(body?.postId);

        if (!Number.isInteger(postId) || postId <= 0) {
            return NextResponse.json({ message: "Invalid post id" }, { status: 400 });
        }

        const headerStore = await headers();
        const session = await auth.api.getSession({ headers: headerStore });

        const ipAddress = headerStore.get("x-forwarded-for") ?? undefined;
        const sessionId = headerStore.get("x-vercel-id") ?? undefined;

        await db.insert(postViews).values({
            postId,
            userId: session?.user?.id,
            sessionId,
            ipAddress,
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
