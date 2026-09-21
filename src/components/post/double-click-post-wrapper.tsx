"use client";

import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

interface DoubleClickPostWrapperProps {
    slug: string;
    postId?: number;
    className?: string;
    children: ReactNode;
    title?: string;
}

export default function DoubleClickPostWrapper({
    slug,
    postId,
    className,
    children,
    title = "Double-click to open post",
}: DoubleClickPostWrapperProps) {
    const router = useRouter();

    const handleDoubleClick = (e: React.MouseEvent) => {
        // Prevent opening post if clicking on an inner tag link or explicit external action
        const target = e.target as HTMLElement;
        if (target.closest("[data-no-post-nav]")) {
            return;
        }

        if (postId) {
            try {
                const storageKey = "velo_view_session_key";
                let sessionKey = window.sessionStorage.getItem(storageKey);
                if (!sessionKey) {
                    sessionKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
                    window.sessionStorage.setItem(storageKey, sessionKey);
                }
                fetch("/api/post-view", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postId, sessionKey }),
                    keepalive: true,
                }).catch(() => {});
            } catch {}
        }

        router.push(`/post/${slug}`);
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            title={title}
            className={className}
        >
            {children}
        </div>
    );
}
