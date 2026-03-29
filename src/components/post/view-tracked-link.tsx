"use client";

import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

interface ViewTrackedLinkProps extends LinkProps {
    postId: number;
    className?: string;
}

function ViewTrackedLink({ postId, href, className, children, ...props }: PropsWithChildren<ViewTrackedLinkProps>) {
    const handleClick = () => {
        fetch("/api/post-view", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId }),
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
