import type { Config } from "drizzle-kit"

export default {
    out: "./drizzle",
    schema: "./src/db/schema/index.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL as string
    },
    verbose: true,
    strict: true
} satisfies Config
