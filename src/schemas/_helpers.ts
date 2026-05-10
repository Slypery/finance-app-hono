import Decimal from 'decimal.js'
import z from 'zod'

export const nullishStringInput = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullish()

export const nullishDateStringInput = z
  .preprocess(
    (val) => (val === '' ? null : val),
    z.union([
      z.iso.date().refine((val) => !isNaN(new Date(val).getTime()), 'Invalid date'),
      z.null(),
      z.undefined(),
    ])
  )
  .nullish()

const validCurrencies = new Set(Intl.supportedValuesOf('currency'))

export const currencyInput = z
  .string()
  .refine((val) => validCurrencies.has(val.toUpperCase()), { message: 'Invalid currency code' })

export const stringDecimalInput = ({ min, max }: { min?: string; max?: string } = {}) =>
  z
    .string()
    .regex(/^\d+(\.\d+)?$/, { message: 'Invalid decimal' })
    .refine((val) => (min ? new Decimal(val).greaterThanOrEqualTo(min) : true), {
      message: `Must be at least ${min}`,
    })
    .refine((val) => (max ? new Decimal(val).lessThanOrEqualTo(max) : true), {
      message: `Must be at most ${max}`,
    })
