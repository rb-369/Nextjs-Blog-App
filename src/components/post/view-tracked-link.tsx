"use client";

import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

interface ViewTrackedLinkProps extends LinkProps {
    postId: number;
    className?: string;
}

function getOrCreateViewSessionKey() {
    const storageKey = "velo_view_session_key";
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) {
        return existing;
    }

    const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(storageKey, generated);
    return generated;
}

function ViewTrackedLink({ postId, href, className, children, ...props }: PropsWithChildren<ViewTrackedLinkProps>) {
    const handleClick = () => {
        const sessionKey = getOrCreateViewSessionKey();
        fetch("/api/post-view", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId, sessionKey }),
            keepalive: true,
        }).catch(() => {
            // Non-blocking tracking call.
        });
    };

    return (
        <Link href={href} className={className} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}

export default ViewTrackedLink;
