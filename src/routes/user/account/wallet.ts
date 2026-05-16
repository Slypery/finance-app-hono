import { jsonValidator } from '@/helpers/validator'
import { UserVariables } from '@/routes/user/_index'
import { deleteAccountInput } from '@/schemas/account/deleteAccount.schema'
import { createWalletSchema, updateWalletSchema } from '@/schemas/account/wallet.schema'
import { deleteAccount } from '@/services/account/deleteAccount.service'
import {
  createWallet,
  getWallet,
  getWallets,
  updateWallet,
} from '@/services/account/wallet.service'
import { Hono } from 'hono'

export const walletRoute = new Hono<{ Variables: UserVariables }>()

// Create Wallet
walletRoute.post('/', jsonValidator(createWalletSchema), async (c) => {
  const input = c.req.valid('json')
  const wallet = await createWallet({ ...input, userId: c.get('userId') })

  return c.json({ success: true, data: wallet })
})

// Get Wallet
walletRoute.get('/', async (c) => {
  const walletData = await getWallets(c.get('userId'))

  return c.json({ success: true, data: walletData })
})

// Get Wallet Detail
walletRoute.get('/:accountId', async (c) => {
  const walletDetail = await getWallet({
    userId: c.get('userId'),
    accountId: c.req.param('accountId'),
  })

  return c.json({ success: true, data: walletDetail })
})

// Patch Wallet
walletRoute.patch('/', jsonValidator(updateWalletSchema), async (c) => {
  const input = c.req.valid('json')
  const wallet = await updateWallet({ ...input, userId: c.get('userId') })

  return c.json({ success: true, data: wallet })
})

// Delete Wallet
walletRoute.delete('/', jsonValidator(deleteAccountInput), async (c) => {
  const input = c.req.valid('json')
  await deleteAccount({ accountId: input.accountId, userId: c.get('userId') })

  return c.json({ success: true })
})
