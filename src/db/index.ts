import { drizzle } from 'drizzle-orm/bun-sql'
import { SQL } from 'bun'
import * as schema from '@/db/schema'
import { DATABASE_URL } from '@/env'

const g = global as typeof globalThis & { sql?: SQL }

g.sql ??= new SQL(DATABASE_URL)

export const db = drizzle(g.sql, { schema })