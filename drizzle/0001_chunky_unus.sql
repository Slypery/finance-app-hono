CREATE TYPE "public"."account_normal_balance" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."ledger_side" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"normal_balance" "ledger_side" NOT NULL,
	"description" text,
	"currency" text DEFAULT 'IDR',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "accounts_id_type_unique" UNIQUE("id","type"),
	CONSTRAINT "accounts_user_name_unique" UNIQUE("user_id","name"),
	CONSTRAINT "account_type_check" CHECK (type IN ('wallet', 'receivable', 'payable', 'illiquid'))
);
--> statement-breakpoint
CREATE TABLE "illiquids" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"account_type" text DEFAULT 'illiquid' NOT NULL,
	"asset_type" text,
	"quantity" numeric,
	"unit" text,
	"acquisition_price" numeric,
	"acquisition_date" timestamp,
	CONSTRAINT "illiquids_type_check" CHECK (account_type = 'illiquid')
);
--> statement-breakpoint
CREATE TABLE "payables" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"account_type" text DEFAULT 'payable' NOT NULL,
	"creditor_name" text NOT NULL,
	"due_date" timestamp,
	CONSTRAINT "payables_type_check" CHECK (account_type = 'payable')
);
--> statement-breakpoint
CREATE TABLE "receivables" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"account_type" text DEFAULT 'receivable' NOT NULL,
	"contact_name" text,
	"contact_info" text,
	"due_date" timestamp,
	CONSTRAINT "receivables_type_check" CHECK (account_type = 'receivable')
);
--> statement-breakpoint
CREATE TABLE "transaction_lines" (
	"transaction_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "ledger_side" NOT NULL,
	"amount" numeric DEFAULT '0' NOT NULL,
	"exchange_rate" numeric,
	CONSTRAINT "transaction_lines_transaction_id_sequence_pk" PRIMARY KEY("transaction_id","sequence")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"category" text,
	"description" text,
	"base_currency" text NOT NULL,
	"transacted_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_type_check" CHECK (type IN ('income', 'expense', 'transfer'))
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"account_type" text DEFAULT 'wallet' NOT NULL,
	"bank_name" text,
	"bank_number" text,
	CONSTRAINT "wallets_type_check" CHECK (account_type = 'wallet')
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "illiquids" ADD CONSTRAINT "illiquids_account_id_account_type_accounts_id_type_fk" FOREIGN KEY ("account_id","account_type") REFERENCES "public"."accounts"("id","type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payables" ADD CONSTRAINT "payables_account_id_account_type_accounts_id_type_fk" FOREIGN KEY ("account_id","account_type") REFERENCES "public"."accounts"("id","type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_account_id_account_type_accounts_id_type_fk" FOREIGN KEY ("account_id","account_type") REFERENCES "public"."accounts"("id","type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_account_id_account_type_accounts_id_type_fk" FOREIGN KEY ("account_id","account_type") REFERENCES "public"."accounts"("id","type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_transacted_at_idx" ON "transactions" USING btree ("transacted_at");