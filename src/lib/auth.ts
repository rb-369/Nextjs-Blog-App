import {betterAuth} from 'better-auth'
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import { db } from './db'
import * as schema from "./db/schema"

function resolveBaseUrl() {
    if (process.env.NODE_ENV === "production") {
        if (process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")) {
            return process.env.NEXT_PUBLIC_BASE_URL;
        }
        if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
            return process.env.NEXT_PUBLIC_APP_URL;
        }
        if (process.env.BASE_URL && !process.env.BASE_URL.includes("localhost")) {
            return process.env.BASE_URL;
        }
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        }
        if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
        }
        return "https://velo-blogs.vercel.app";
    }

    return process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export const auth = betterAuth({
    appName: "VELO",
    secret: process.env.BETTER_AUTH_SECRET || "BETTER_AUTH_SECRET",
    baseURL: resolveBaseUrl(),
    trustedOrigins: [
        "https://velo-blogs.vercel.app",
        "https://velo-blogs.vercel.app/",
        "http://localhost:3000",
        ...(process.env.BASE_URL ? [process.env.BASE_URL] : []),
        ...(process.env.NEXT_PUBLIC_BASE_URL ? [process.env.NEXT_PUBLIC_BASE_URL] : []),
        ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
        ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
    ],
    database: drizzleAdapter(db, {
        provider:"pg",
        schema: {
            ...schema,
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        }
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
		maxPasswordLength: 128,
		autoSignIn: false,
    },
    session: {
        expiresIn: 60*60*24*7,
        updateAge: 60*60*24,
        cookieCache: {
            enabled:true,
            maxAge: 60 * 5
        },
        disableSessionRefresh: true,
        
    },
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        defaultCookieAttributes: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }
    }
})