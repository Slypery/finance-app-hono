import { InferSelectModel, sql } from 'drizzle-orm'
import { check, decimal, foreignKey, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

export type Users = InferSelectModel<typeof users>
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerifiedAt: timestamp('email_verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type RefreshTokens = InferSelectModel<typeof refreshTokens>
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshTokenHash: text('refresh_token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('refresh_token_user_idx').on(table.userId)]
)

export const ledgerSideEnum = pgEnum('ledger_side', ['debit', 'credit'])

export type Accounts = InferSelectModel<typeof accounts>
export const accountNormalBalanceEnum = pgEnum('account_normal_balance', ['debit', 'credit'])
export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    normalBalance: ledgerSideEnum('normal_balance').notNull(),
    description: text('description'),
    currency: text('currency').default('IDR'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    check('account_type_check', sql`type IN ('wallet', 'receivable', 'payable', 'illiquid')`),
    unique('accounts_id_type_unique').on(table.id, table.type),
    unique('accounts_user_name_unique').on(table.userId, table.name),
    index('accounts_user_id_idx').on(table.userId),
  ]
)

export type Wallets = InferSelectModel<typeof wallets>
export const wallets = pgTable(
  'wallets',
  {
    accountId: uuid('account_id').primaryKey(),
    accountType: text('account_type').notNull().default('wallet'),
    bankName: text('bank_name'),
    bankNumber: text('bank_number'),
  },
  (table) => [
    check('wallets_type_check', sql`account_type = 'wallet'`),
    foreignKey({
      columns: [table.accountId, table.accountType],
      foreignColumns: [accounts.id, accounts.type],
    }).onDelete('cascade'),
  ]
)

export type Receivables = InferSelectModel<typeof receivables>
export const receivables = pgTable(
  'receivables',
  {
    accountId: uuid('account_id').primaryKey(),
    accountType: text('account_type').notNull().default('receivable'),
    contactName: text('contact_name').notNull(),
    contactInfo: text('contact_info'),
    dueDate: timestamp('due_date'),
  },
  (table) => [
    check('receivables_type_check', sql`account_type = 'receivable'`),
    foreignKey({
      columns: [table.accountId, table.accountType],
      foreignColumns: [accounts.id, accounts.type],
    }).onDelete('cascade'),
  ]
)

export type Payables = InferSelectModel<typeof payables>
export const payables = pgTable(
  'payables',
  {
    accountId: uuid('account_id').primaryKey(),
    accountType: text('account_type').notNull().default('payable'),
    creditorName: text('creditor_name').notNull(),
    dueDate: timestamp('due_date'),
  },
  (table) => [
    check('payables_type_check', sql`account_type = 'payable'`),
    foreignKey({
      columns: [table.accountId, table.accountType],
      foreignColumns: [accounts.id, accounts.type],
    }).onDelete('cascade'),
  ]
)

export type Illiquids = InferSelectModel<typeof illiquids>
export const illiquids = pgTable(
  'illiquids',
  {
    accountId: uuid('account_id').primaryKey(),
    accountType: text('account_type').notNull().default('illiquid'),
    assetType: text('asset_type'),
    quantity: decimal('quantity'),
    unit: text('unit'),
    acquisitionPrice: decimal('acquisition_price'),
    acquisitionDate: timestamp('acquisition_date'),
  },
  (table) => [
    check('illiquids_type_check', sql`account_type = 'illiquid'`),
    foreignKey({
      columns: [table.accountId, table.accountType],
      foreignColumns: [accounts.id, accounts.type],
    }).onDelete('cascade'),
  ]
)

export type Transactions = InferSelectModel<typeof transactions>
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    category: text('category'),
    description: text('description'),
    baseCurrency: text('base_currency').notNull(),
    transactedAt: timestamp('transacted_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    check('transaction_type_check', sql`type IN ('income', 'expense', 'transfer')`),
    index('transactions_user_id_idx').on(table.userId),
    index('transactions_transacted_at_idx').on(table.transactedAt),
  ]
)

export type TransactionLines = InferSelectModel<typeof transactionLines>
export const  transactionLines = pgTable(
  'transaction_lines',
  {
    transactionId: uuid('transaction_id').notNull(),
    sequence: integer('sequence').notNull(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    type: ledgerSideEnum('type').notNull(),
    amount: decimal('amount', {mode: 'string'}).notNull().default('0'),
    exchangeRate: decimal('exchange_rate'),
  },
  (table) => [
    primaryKey({ columns: [table.transactionId, table.sequence] }),
    foreignKey({ columns: [table.transactionId], foreignColumns: [transactions.id] }).onDelete(
      'cascade'
    ),
  ]
)