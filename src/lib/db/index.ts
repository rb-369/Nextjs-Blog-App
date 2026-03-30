import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import * as schema from "./schema";

const connectionString =
    process.env.DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
    throw new Error(
        "Database connection string is missing. Set DB_URL (or DATABASE_URL/POSTGRES_URL/POSTGRES_PRISMA_URL/POSTGRES_URL_NON_POOLING) in environment variables."
    );
}

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