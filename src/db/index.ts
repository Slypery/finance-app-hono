import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from '@/db/schema'
import { DATABASE_URL } from '@/env'

export const db = drizzle({ connection: DATABASE_URL, schema: schema })
