import z, { nullish } from 'zod';

export type CreateReceivableInput = z.infer<typeof createReceivableSchema>
export const createReceivableSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  currency: z.string().trim(),
  contactName: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  contactInfo: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  dueDate: z.date().nullish()
})


export type UpdateReceivableInput = z.infer<typeof updateReceivableSchema>
export const updateReceivableSchema = z.object({
  accountId: z.string().trim(),
  name: z.string().trim().optional(),
  description: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  contactName: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  contactInfo: z.string().trim().transform(v => v === '' ? null : v).nullish(),
  dueDate: z.date().nullish()
})
