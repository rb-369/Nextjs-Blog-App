import { createAuthClient } from "better-auth/react";

function resolveAuthBaseUrl() {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return process.env.BASE_URL || "https://velo-blogs.vercel.app";
}

export const authClient = createAuthClient({
    baseURL: resolveAuthBaseUrl(),

})

export const {signUp, signIn, signOut, useSession} = authClient;