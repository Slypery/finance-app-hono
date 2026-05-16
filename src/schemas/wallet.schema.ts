import { currencyInput, nullishStringInput } from '@/schemas/_helpers'
import z from 'zod'

export type CreateWalletInput = z.infer<typeof createWalletSchema>
export const createWalletSchema = z.object({
  name: z.string().trim().nonempty(),
  description: nullishStringInput,
  currency: currencyInput,
  bankName: nullishStringInput,
  bankNumber: nullishStringInput,
})

export type UpdateWalletInput = z.infer<typeof updateWalletSchema>
export const updateWalletSchema = z.object({
  accountId: z.string().trim(),
  name: z.string().trim().nonempty().nullish(),
  description: nullishStringInput,
  bankName: nullishStringInput,
  bankNumber: nullishStringInput,
})
