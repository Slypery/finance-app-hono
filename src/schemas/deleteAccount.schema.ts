import z from 'zod'

export type DeleteAccountInput = z.infer<typeof deleteAccountInput>
export const deleteAccountInput = z.object({
  accountId: z.string().trim(),
})
