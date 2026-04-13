import '@/env'
import { AppError } from '@/errors/app.error'
import { appRoute } from '@/routes/_app'
import { authRoute } from '@/routes/_auth'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger())

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, code: err.code, error: err.message }, err.statusCode)
  }
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.route('/api/v1/auth/', authRoute)
app.route('/api/v1/', appRoute)

export default app
