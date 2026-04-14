import z, { string } from 'zod';

export type CreateWalletInput = z.infer<typeof createWalletSchema>
export const createWalletSchema = z.object({
  name: z.string().trim(),
  description: string().trim().optional(),
  currency: string().trim(),
  bankName: string().trim().optional(),
  bankNumber: string().trim().optional()
})


export type UpdateWalletInput = z.infer<typeof updateWalletSchema>
export const updateWalletSchema = z.object({
  accountId: z.string().trim(),
  name: z.string().trim().optional(),
  description: string().trim().transform(v => v === '' ? null : v).nullish(),
  bankName: string().trim().transform(v => v === '' ? null : v).nullish(),
  bankNumber: string().trim().transform(v => v === '' ? null : v).nullish()
})
