import { PORT } from '@/env'
import { AppError } from '@/errors/app.error'
import { appRoute } from '@/routes/_app'
import { authRoute } from '@/routes/_auth'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { appendFile, mkdir } from 'node:fs/promises'

const app = new Hono()

app.use(logger())

async function writeErrorLog(err: Error) {
  const log = `[${new Date().toISOString()}] ${err.stack ?? err.message}\n`
  await mkdir('logs', { recursive: true })
  await appendFile('logs/error.log', log)
}

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, code: err.code, error: err.message }, err.statusCode)
  }

  writeErrorLog(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/', (c) => {
  return c.json({ hello: 'world' })
})

app.route('/api/v1/auth/', authRoute)
app.route('/api/v1/', appRoute)

serve({
  fetch: app.fetch,
  port: Number(PORT) || 3000
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})