import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

export const jsonValidator = <T extends z.ZodTypeAny>(schema: T) =>
  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: 'Invalid request',
          errors: result.error.issues,
        },
        422
      )
    }
  })

export const paramValidator = <T extends z.ZodTypeAny>(schema: T) =>
zValidator('param', schema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: false,
        code: 'INVALID_REQUEST',
        error: result.error.issues,
      },
      422
    )
  }
})

export const queryValidator = <T extends z.ZodTypeAny>(schema: T) =>
zValidator('query', schema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: false,
        code: 'INVALID_REQUEST',
        error: result.error.issues,
      },
      422
    )
  }
})
