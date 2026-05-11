import { db } from '@/db'
import { accounts, Users } from '@/db/schema'
import { AccountNotFoundError } from '@/errors/account.error'
import { DeleteAccountInput } from '@/schemas/deleteAccount.schema'
import { isAccountBelongsToUser } from '@/services/account/_helpers'
import { eq } from 'drizzle-orm'

export async function deleteAccount(input: DeleteAccountInput & { userId: Users['id'] }) {
  if (!(await isAccountBelongsToUser(input.accountId, input.userId)))
    throw new AccountNotFoundError()

  db.delete(accounts).where(eq(accounts.id, input.accountId))

  return true
}
