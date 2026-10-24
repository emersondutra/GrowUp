import { relations } from 'drizzle-orm';
import { doublePrecision, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth UID & System Profile)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(),
  fullName: text('full_name').notNull().default(''),
  name: text('name').notNull().default(''),
  email: text('email').notNull().unique(),
  cpf: text('cpf').unique(),
  role: text('role').notNull().default('cliente'), // 'admin' | 'cliente'
  status: text('status').notNull().default('ativo'), // 'ativo' | 'inativo'
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Investment Positions
export const positions = pgTable('positions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  name: text('name').notNull(),
  market: text('market').notNull(), // 'BR' | 'US'
  assetClass: text('asset_class').notNull(), // 'Ação' | 'FII' | 'Stock' | 'ETF' | 'REIT' | 'BDR'
  currentPrice: doublePrecision('current_price').notNull(),
  currentPriceCurrency: text('current_price_currency').notNull().default('BRL'),
  avgPrice: doublePrecision('avg_price').notNull(),
  totalQuantity: doublePrecision('total_quantity').notNull(),
  quantityUnitLabel: text('quantity_unit_label').default('COTAS'),
  targetPercent: doublePrecision('target_percent').default(0),
  currentPercent: doublePrecision('current_percent').default(0),
  dayChangePercent: doublePrecision('day_change_percent').default(0),
  totalProfitLoss: doublePrecision('total_profit_loss').default(0),
  totalProfitLossPercent: doublePrecision('total_profit_loss_percent').default(0),
  statusLabel: text('status_label'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Broker allocations per position
export const brokerAllocations = pgTable('broker_allocations', {
  id: serial('id').primaryKey(),
  positionId: text('position_id')
    .notNull()
    .references(() => positions.id, { onDelete: 'cascade' }),
  broker: text('broker').notNull(), // 'XP' | 'Avenue' | 'NuInvest' | 'IBKR' | 'BTG' | 'Schwab'
  brokerFullName: text('broker_full_name').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  valueBrl: doublePrecision('value_brl').notNull(),
  valueUsd: doublePrecision('value_usd').notNull(),
});

// Transactions / Orders (CRUD de Lançamentos)
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'COMPRA' | 'VENDA' | 'PROVENTO'
  ticker: text('ticker').notNull(),
  name: text('name').notNull(),
  market: text('market').notNull(), // 'BR' | 'US'
  assetClass: text('asset_class').notNull(),
  broker: text('broker').notNull(),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  quantity: doublePrecision('quantity').notNull(),
  price: doublePrecision('price').notNull(),
  currency: text('currency').notNull().default('BRL'),
  fees: doublePrecision('fees').default(0),
  total: doublePrecision('total').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Dividends / Proventos
export const dividends = pgTable('dividends', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  assetClass: text('asset_class').notNull(),
  broker: text('broker').notNull(),
  market: text('market').notNull(), // 'BR' | 'US'
  perShare: doublePrecision('per_share').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  paymentDate: text('payment_date').notNull(),
  status: text('status').notNull(), // 'CONFIRMADO' | 'PROVISIONADO' | 'APROVADO AGE' | 'MENSAL'
  totalAmount: doublePrecision('total_amount').notNull(),
  currency: text('currency').notNull().default('BRL'),
  grossAmount: doublePrecision('gross_amount'),
  taxDeduction: text('tax_deduction'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Broker Balances / Saldos em Corretoras
export const brokerBalances = pgTable('broker_balances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  broker: text('broker').notNull(),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('BRL'),
  total: doublePrecision('total').notNull(),
  freeCash: doublePrecision('free_cash').notNull(),
  status: text('status').notNull().default('connected'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  positions: many(positions),
  transactions: many(transactions),
  dividends: many(dividends),
  brokerBalances: many(brokerBalances),
}));

export const positionsRelations = relations(positions, ({ one, many }) => ({
  user: one(users, {
    fields: [positions.userId],
    references: [users.id],
  }),
  brokerAllocations: many(brokerAllocations),
}));

export const brokerAllocationsRelations = relations(brokerAllocations, ({ one }) => ({
  position: one(positions, {
    fields: [brokerAllocations.positionId],
    references: [positions.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const dividendsRelations = relations(dividends, ({ one }) => ({
  user: one(users, {
    fields: [dividends.userId],
    references: [users.id],
  }),
}));

export const brokerBalancesRelations = relations(brokerBalances, ({ one }) => ({
  user: one(users, {
    fields: [brokerBalances.userId],
    references: [users.id],
  }),
}));
