import { jsonValidator } from '@/helpers/validator'
import { AppVariables } from '@/routes/_app'
import { createWalletSchema, updateWalletSchema } from '@/schemas/wallet.schema'
import { createWallet, getWallets, updateWallet } from '@/services/account/wallet.service'
import { Hono } from 'hono'

export const walletRoute = new Hono<{ Variables: AppVariables }>()

walletRoute.post('/', jsonValidator(createWalletSchema), async (c) => {
  const input = c.req.valid('json')
  const wallet = await createWallet({
    ...input,
    userId: c.get('userId'),
  })

  return c.json(wallet)
})

walletRoute.get('/', async (c) => {
  const walletData = await getWallets(c.get('userId'))

  return c.json(walletData)
})

walletRoute.patch('/', jsonValidator(updateWalletSchema), async (c) => {
  const input = c.req.valid('json')
  const wallet = await updateWallet({
    ...input,
    userId: c.get('userId')
  })

  return c.json(wallet)
})
