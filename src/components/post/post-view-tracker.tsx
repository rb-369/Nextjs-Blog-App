"use client";

import { useEffect, useRef } from "react";

interface PostViewTrackerProps {
    postId: number;
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

function PostViewTracker({ postId }: PostViewTrackerProps) {
    const startedAtRef = useRef<number>(Date.now());

    useEffect(() => {
        const sessionKey = getOrCreateViewSessionKey();

        fetch("/api/post-view", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId, sessionKey }),
            keepalive: true,
        }).catch(() => {
            // Non-blocking analytics call.
        });

        const sendDuration = () => {
            const durationSeconds = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
            const payload = JSON.stringify({ postId, sessionKey, durationSeconds });
            navigator.sendBeacon("/api/post-view", payload);
        };

        window.addEventListener("beforeunload", sendDuration);

        return () => {
            window.removeEventListener("beforeunload", sendDuration);
            sendDuration();
        };
    }, [postId]);

    return null;
}

export default PostViewTracker;
