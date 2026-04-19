import { db } from '@/db'
import { accounts, Accounts, Users, wallets, Wallets } from '@/db/schema'
import { AccountAlreadyExistsError, AccountNotFoundError, AccountUpdateAlreadyExistsError } from '@/errors/account.error'
import { NoFieldsToUpdateError } from '@/errors/app.error'
import { CreateWalletInput, UpdateWalletInput } from '@/schemas/wallet.schema'
import {
  accountBalanceSubquery,
  isAccountBelongsToUser,
  isAccountNameTaken,
} from '@/services/account/_helpers'
import { and, eq, sql } from 'drizzle-orm'

type WalletData = {
  accountId: Accounts['id']
  name: Accounts['name']
  description: Accounts['description'] | null
  currency: Accounts['currency'] | null
  bankName: Wallets['bankName'] | null
  bankNumber: Wallets['bankNumber'] | null
  balance: string
}

export async function createWallet(
  input: CreateWalletInput & { userId: string }
): Promise<WalletData> {
  if (await isAccountNameTaken(input.name, input.userId))
    throw new AccountAlreadyExistsError(input.name)

  const wallet = await db.transaction(async (tx): Promise<WalletData> => {
    const [account] = await tx
      .insert(accounts)
      .values({
        userId: input.userId,
        type: 'wallet',
        normalBalance: 'debit',
        name: input.name,
        description: input.description,
        currency: input.currency,
      })
      .returning()

    const [wallet] = await tx
      .insert(wallets)
      .values({
        accountId: account.id,
        accountType: account.type,
        bankName: input.bankName,
        bankNumber: input.bankNumber,
      })
      .returning()

    return {
      accountId: account.id,
      name: account.name,
      description: account.description,
      currency: account.currency,
      bankName: wallet.bankName,
      bankNumber: wallet.bankNumber,
      balance: '0',
    }
  })
  return wallet
}

export async function getWallets(userId: Users['id']): Promise<WalletData[]> {
  const balances = accountBalanceSubquery()
  return db
    .select({
      accountId: accounts.id,
      name: accounts.name,
      description: accounts.description,
      currency: accounts.currency,
      bankName: wallets.bankName,
      bankNumber: wallets.bankNumber,
      balance: sql`COALESCE(${balances.balance}, '0')`.mapWith(String),
    })
    .from(accounts)
    .innerJoin(wallets, eq(accounts.id, wallets.accountId))
    .leftJoin(balances, eq(accounts.id, balances.accountId))
    .where(eq(accounts.userId, userId))
}

export async function updateWallet(
  input: UpdateWalletInput & { userId: Users['id']}
): Promise<WalletData> {
  if (!input.name && !input.description && !input.bankName && !input.bankNumber) throw new NoFieldsToUpdateError()

  if (!(await isAccountBelongsToUser(input.accountId, input.userId)))
    throw new AccountNotFoundError()

  if (input.name && await isAccountNameTaken(input.name, input.userId, input.accountId))
    throw new AccountUpdateAlreadyExistsError(input.name)

  const wallet = await db.transaction(async (tx): Promise<WalletData> => {
    const [account] = await tx
      .update(accounts)
      .set({
        ...((input.name !== undefined) && (input.name !== null) && {name: input.name}),
        ...(input.description !== undefined && {description: input.description}),
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, input.accountId), eq(accounts.type, 'wallet')))
      .returning()

    const [wallet] = await tx
      .update(wallets)
      .set({
        accountId: wallets.accountId,
        ...(input.bankName !== undefined && {bankName: input.bankName}),
        ...(input.bankNumber !== undefined && {bankNumber: input.bankNumber}),
      })
      .where(eq(wallets.accountId, input.accountId))
      .returning()

    return {
      accountId: account.id,
      name: account.name,
      description: account.description,
      currency: account.currency,
      bankName: wallet.bankName,
      bankNumber: wallet.bankNumber,
      balance: '0',
    }
  })
  return wallet
}
