import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as authSchema from "./auth.schema"

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/constructa"
const client = postgres(connectionString)
export const db = drizzle(client, { schema: authSchema })

export { authSchema }