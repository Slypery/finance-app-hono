import { db } from '@/db'
import { Accounts, accounts, transactionLines, Users } from '@/db/schema'
import { and, eq, ne, sql } from 'drizzle-orm'

export async function isAccountNameTaken(
  accountName: Accounts['name'],
  userId: Users['id'],
  exceptAccountId?: Accounts['id']
): Promise<Boolean> {
  const result = await db.query.accounts.findFirst({
    columns: { id: true },
    where: and(
      eq(accounts.name, accountName),
      eq(accounts.userId, userId),
      exceptAccountId ? ne(accounts.id, exceptAccountId) : undefined
    ),
  })

  return result !== undefined
}

export async function isAccountBelongsToUser(
  accountId: Accounts['id'],
  userId: Users['id']
): Promise<Boolean> {
  const result = await db.query.accounts.findFirst({
    columns: { id: true },
    where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
  })

  return result !== undefined
}

export function accountBalanceSubquery() {
  return db
    .select({
      accountId: transactionLines.accountId,
      balance: sql`
        COALESCE(
          SUM(${transactionLines.amount} *
          CASE WHEN ${transactionLines.type} = ${accounts.normalBalance} THEN 1 ELSE -1 END),
          0
        )
        `
        .mapWith(String)
        .as('balance'),
    })
    .from(transactionLines)
    .innerJoin(accounts, eq(accounts.id, transactionLines.accountId))
    .groupBy(transactionLines.accountId)
    .as('balances')
}
