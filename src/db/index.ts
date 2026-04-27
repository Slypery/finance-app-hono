import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/db/schema'
import { DATABASE_URL } from '@/env'

const g = global as typeof globalThis & { pool?: Pool }

g.pool ??= new Pool({ connectionString: DATABASE_URL })

export const db = drizzle(g.pool, { schema })