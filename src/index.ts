import '@/env'
import { appRoute } from '@/routes/_app'
import { authRoute } from '@/routes/_auth'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger())

app.route('/api/v1/auth', authRoute)
app.route('/api/v1', appRoute)

export default app
