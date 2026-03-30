import {Config} from "drizzle-kit";

export default {
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || ""
    },
    verbose: true,
    strict: true

} satisfies Config