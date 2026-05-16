import { currencyInput, nullishDateStringInput, nullishStringInput } from '@/schemas/_helpers'
import z from 'zod'

export type CreateReceivableInput = z.infer<typeof createReceivableSchema>
export const createReceivableSchema = z.object({
  name: z.string().trim(),
  description: nullishStringInput,
  currency: currencyInput,
  contactName: nullishStringInput,
  contactInfo: nullishStringInput,
  dueDate: nullishDateStringInput,
})

export type UpdateReceivableInput = z.infer<typeof updateReceivableSchema>
export const updateReceivableSchema = z.object({
  accountId: z.string().trim(),
  name: z.string().trim().optional(),
  description: nullishStringInput,
  contactName: nullishStringInput,
  contactInfo: nullishStringInput,
  dueDate: nullishDateStringInput,
})
