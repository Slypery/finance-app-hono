import { authMiddleware } from '@/middleware/auth'
import { receivableRoute } from '@/routes/account/receivable'
import { walletRoute } from '@/routes/account/wallet'
import { profileRoute } from '@/routes/profile'
import { Hono } from 'hono'

export type AppVariables = {
  userId: string
}
export const appRoute = new Hono()
appRoute.use(authMiddleware)

appRoute.get('/', (c) => {
  return c.json({ hello: 'world' })
})

appRoute.route('/me', profileRoute)
appRoute.route('/me/wallets', walletRoute)
appRoute.route('/me/receivables', receivableRoute)

