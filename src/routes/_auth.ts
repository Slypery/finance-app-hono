import { jsonValidator } from '@/helpers/validator'
import { loginSchema, registerSchema } from '@/schemas/auth.schema'
import { loginUser, refreshAccessToken, registerNewUser } from '@/services/auth.service'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

export const authRoute = new Hono()

authRoute.post('/register', jsonValidator(registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')

  const result = await registerNewUser({ name, email, password })

  return c.json({ success: true, data: result })
})

authRoute.post('/login', jsonValidator(loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const result = await loginUser(email, password)

  c.res.headers.set(
    'Set-Cookie',
    `refreshToken=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=api/v1/auth/refresh-access-token; Max-Age=${60 * 60 * 24 * 30}`
  )

  return c.json({
    success: true,
    data: { accessToken: result.accessToken, user: result.user },
  })
})

authRoute.post('/refresh-access-token', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken')

  if (!refreshToken) return c.json({ success: false, code: 'NO_REFRESH_TOKEN_PROVIDED', error: 'No refresh token provided' }, 401)

  const result = await refreshAccessToken(refreshToken)

  c.res.headers.set(
    'Set-Cookie',
    `refreshToken=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=api/v1/auth/refresh-access-token; Max-Age=${60 * 60 * 24 * 30}`
  )

  return c.json({ success: true, data: { accessToken: result.accessToken } }, 200)
})