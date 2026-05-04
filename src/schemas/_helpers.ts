import z from 'zod'

export const nullishString = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullish()

export const nullishDate = z
  .preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.iso.date().transform((val) => new Date(val)), z.date(), z.null(), z.undefined()])
  )
  .nullish()
