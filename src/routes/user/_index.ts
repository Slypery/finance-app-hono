import { authMiddleware } from '@/middleware/auth'
import { receivableRoute } from '@/routes/user/account/receivable'
import { walletRoute } from '@/routes/user/account/wallet'
import { profileRoute } from '@/routes/user/profile'
import { Hono } from 'hono'

export type UserVariables = {
  userId: string
}
export const userRoute = new Hono()
userRoute.use(authMiddleware)

userRoute.route('/me', profileRoute)
userRoute.route('/me/wallets', walletRoute)
userRoute.route('/me/receivables', receivableRoute)
