import z from 'zod';

export type CreateWalletInput = z.infer<typeof createWalletSchema>
export const createWalletSchema = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  currency: z.string().trim().nonempty(),
  bankName: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  bankNumber: z.string().trim().transform(v => v === '' ? null : v).nullish()
})


export type UpdateWalletInput = z.infer<typeof updateWalletSchema>
export const updateWalletSchema = z.object({
  accountId: z.string().trim(),
  name: z.string().trim().nonempty().nullish(),
  description: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  bankName: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  bankNumber: z.string().trim().transform(v => v === '' ? null : v).nullish()
})
