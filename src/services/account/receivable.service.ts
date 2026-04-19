import { db } from '@/db'
import { accounts, Accounts, receivables, Receivables, Users } from '@/db/schema'
import { AccountAlreadyExistsError, AccountNotFoundError, AccountUpdateAlreadyExistsError } from '@/errors/account.error'
import { NoFieldsToUpdateError } from '@/errors/app.error'
import { CreateReceivableInput, UpdateReceivableInput } from '@/schemas/receivable.schema'
import { accountBalanceSubquery, isAccountBelongsToUser, isAccountNameTaken } from '@/services/account/_helpers'
import { and, eq, sql } from 'drizzle-orm'

type ReceivableData = {
  accountId: Accounts['id']
  name: Accounts['name']
  description: Accounts['description']
  currency: Accounts['currency']
  contactName: Receivables['contactName']
  contactInfo: Receivables['contactInfo']
  dueDate: Receivables['dueDate']
  balance: string
}

export async function createReceivable(
  input: CreateReceivableInput & { userId: Users['id'] }
): Promise<ReceivableData> {
  if (await isAccountNameTaken(input.name, input.userId))
    throw new AccountAlreadyExistsError(input.name)

  const receivable = await db.transaction(async (tx): Promise<ReceivableData> => {
    const [account] = await tx
      .insert(accounts)
      .values({
        userId: input.userId,
        type: 'receivable',
        normalBalance: 'debit',
        name: input.name,
        description: input.description,
        currency: input.currency,
      })
      .returning()

    const [receivable] = await tx
      .insert(receivables)
      .values({
        accountId: account.id,
        accountType: 'receivable',
        contactName: input.contactName,
        contactInfo: input.contactInfo,
        dueDate: input.dueDate,
      })
      .returning()

    return {
      accountId: account.id,
      name: account.name,
      description: account.description,
      currency: account.currency,
      contactName: receivable.contactName,
      contactInfo: receivable.contactInfo,
      dueDate: receivable.dueDate,
      balance: '0',
    }
  })

  return receivable
}

export async function getReceivables(userId: Users['id']): Promise<ReceivableData[]> {
  const balances = accountBalanceSubquery()
  return db
    .select({
      accountId: accounts.id,
      name: accounts.name,
      description: accounts.description,
      currency: accounts.currency,
      contactName: receivables.contactName,
      contactInfo: receivables.contactInfo,
      dueDate: receivables.dueDate,
      balance: sql`COALESCE(${balances.balance}, '0')`.mapWith(String),
    })
    .from(accounts)
    .innerJoin(receivables, eq(accounts.id, receivables.accountId))
    .leftJoin(balances, eq(accounts.id, balances.accountId))
    .where(eq(accounts.userId, userId))
}

export async function updateReceivable(
  input: UpdateReceivableInput & { userId: Users['id'] }
): Promise<ReceivableData> {
  if (
    !input.name &&
    !input.description &&
    !input.contactName &&
    !input.contactInfo &&
    !input.dueDate
  )
    throw new NoFieldsToUpdateError()

  if (!(await isAccountBelongsToUser(input.accountId, input.userId)))
    throw new AccountNotFoundError()

  if (input.name && (await isAccountNameTaken(input.name, input.userId, input.accountId)))
    throw new AccountUpdateAlreadyExistsError(input.name)

  const receivable = await db.transaction(async (tx): Promise<ReceivableData> => {
    const [account] = await tx
      .update(accounts)
      .set({
        ...(input.name !== undefined && input.name !== null && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, input.accountId), eq(accounts.type, 'receivable')))
      .returning()

    const [receivable] = await tx
      .update(receivables)
      .set({
        accountId: receivables.accountId,
        ...(input.contactName !== undefined && { contactName: input.contactName }),
        ...(input.contactInfo !== undefined && { contactInfo: input.contactInfo }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      })
      .where(eq(receivables.accountId, input.accountId))
      .returning()

    return {
      accountId: account.id,
      name: account.name,
      description: account.description,
      currency: account.currency,
      contactName: receivable.contactName,
      contactInfo: receivable.contactInfo,
      dueDate: receivable.dueDate,
      balance: '0',
    }
  })
  return receivable
}
