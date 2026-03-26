import {Config} from "drizzle-kit";

export default {
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DB_URL || ""
    },
    verbose: true,
    strict: true

} satisfies Config