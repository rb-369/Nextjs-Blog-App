import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import * as schema from "./schema";

type DbEnvCandidate = {
    name: string;
    value: string | undefined;
};

const dbEnvCandidates: DbEnvCandidate[] = [
    { name: "DB_URL", value: process.env.DB_URL },
    { name: "DATABASE_URL", value: process.env.DATABASE_URL },
    { name: "POSTGRES_URL", value: process.env.POSTGRES_URL },
    { name: "POSTGRES_PRISMA_URL", value: process.env.POSTGRES_PRISMA_URL },
    { name: "POSTGRES_URL_NON_POOLING", value: process.env.POSTGRES_URL_NON_POOLING },
];

const selectedDbEnv = dbEnvCandidates.find((item) => typeof item.value === "string" && item.value.trim().length > 0);
const connectionString = selectedDbEnv?.value?.trim();

if (!connectionString) {
    throw new Error(
        "Database connection string is missing. Set DB_URL (or DATABASE_URL/POSTGRES_URL/POSTGRES_PRISMA_URL/POSTGRES_URL_NON_POOLING) in environment variables."
    );
}

let parsedDbUrl: URL;

try {
    parsedDbUrl = new URL(connectionString);
} catch {
    throw new Error(`Invalid database URL format in ${selectedDbEnv?.name ?? "environment"}.`);
}

if (process.env.NODE_ENV === "production") {
    const host = parsedDbUrl.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
        throw new Error(`Production DB host cannot be localhost. Check ${selectedDbEnv?.name ?? "DB_URL"}.`);
    }
}

console.log(`[db] using ${selectedDbEnv?.name ?? "unknown"} host=${parsedDbUrl.hostname} port=${parsedDbUrl.port || "default"}`);

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production"? {
        rejectUnauthorized: false
    } : false,
    max: 10
})

export const db = drizzle(pool, {schema});

export async function getClient() {
    
    const client = await pool.connect();

    return client;
}