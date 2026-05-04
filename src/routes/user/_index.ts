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

userRoute.route('/profile', profileRoute)
userRoute.route('/wallets', walletRoute)
userRoute.route('/receivables', receivableRoute)
