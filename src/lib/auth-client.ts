import { createAuthClient } from "better-auth/react";

function resolveAuthBaseUrl() {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }

    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    return process.env.BASE_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
    baseURL: resolveAuthBaseUrl(),

})

export const {signUp, signIn, signOut, useSession} = authClient;