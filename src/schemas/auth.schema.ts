import { z } from 'zod'

export type RegisterInput = z.infer<typeof registerSchema>
export const registerSchema = z.object({
  name: z.string().trim().min(5).max(20),
  email: z.email().trim(),
  password: z.string().min(8),
})

export type LoginInput = z.infer<typeof loginSchema>
export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})
