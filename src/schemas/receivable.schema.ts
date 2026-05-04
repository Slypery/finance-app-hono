import { nullishDate, nullishString } from '@/schemas/_helpers'
import z from 'zod'

export type CreateReceivableInput = z.infer<typeof createReceivableSchema>
export const createReceivableSchema = z.object({
  name: z.string().trim(),
  description: nullishString,
  currency: z.string().trim(),
  contactName: nullishString,
  contactInfo: nullishString,
  dueDate: nullishDate,
})

export type UpdateReceivableInput = z.infer<typeof updateReceivableSchema>
export const updateReceivableSchema = z.object({
  accountId: z.string().trim(),
  name: z.string().trim().optional(),
  description: nullishString,
  contactName: nullishString,
  contactInfo: nullishString,
  dueDate: nullishDate,
})
