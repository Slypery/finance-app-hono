import z from 'zod'

export const nullishString = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullish()
