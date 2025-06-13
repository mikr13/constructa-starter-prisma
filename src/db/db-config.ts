import { drizzle } from "drizzle-orm/node-postgres"
// https://orm.drizzle.team/docs/connect-neon
// import { drizzle } from 'drizzle-orm/neon-http';
import { Pool } from "pg"

import * as schema from "./schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool, { schema })