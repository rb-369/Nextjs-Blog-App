import {betterAuth} from 'better-auth'
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import { db } from './db'
import * as schema from "./db/schema"

function resolveBaseUrl() {
    if (process.env.BASE_URL) {
        return process.env.BASE_URL;
    }

    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return "http://localhost:3000";
}

export const auth = betterAuth({
    appName: "VELO",
    secret: process.env.BETTER_AUTH_SECRET || "BETTER_AUTH_SECRET",
    baseURL: resolveBaseUrl(),
    database: drizzleAdapter(db, {
        provider:"pg",
        schema: {
            ...schema,
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts
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