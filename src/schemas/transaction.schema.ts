import { currencyInput, nullishStringInput, stringDecimalInput } from '@/schemas/_helpers'
import z from 'zod'

const baseCreateTransactionInput = {
  category: nullishStringInput,
  baseCurrency: currencyInput,
  transactedAt: z.iso.datetime(),
  notes: nullishStringInput,
}

const transactionLineInput = z.object({
  accountId: z.uuid(),
  notes: nullishStringInput,
  amount: stringDecimalInput({ min: '1' }),
  exchangeRate: stringDecimalInput({ min: '0' }),
  subLine: z
    .array(
      z.object({
        amount: stringDecimalInput({ min: '0' }),
        notes: z.string(),
      })
    )
    .nullish(),
})

export const transactionInput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('income'),
    ...baseCreateTransactionInput,
    in: z.array(transactionLineInput).min(1),
  }),
  z.object({
    type: z.literal('expense'),
    ...baseCreateTransactionInput,
    out: z.array(transactionLineInput).min(1),
  }),
  z.object({
    type: z.literal('transfer'),
    ...baseCreateTransactionInput,
    in: z.array(transactionLineInput).min(1),
    out: z.array(transactionLineInput).min(1),
  }),
])
