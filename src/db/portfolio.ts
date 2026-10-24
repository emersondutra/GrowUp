import { db } from './index.ts';
import {
  brokerAllocations,
  brokerBalances,
  dividends,
  positions,
  transactions,
} from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import {
  INITIAL_POSITIONS,
  INITIAL_DIVIDENDS,
  INITIAL_TRANSACTIONS,
  INITIAL_BROKER_BALANCES,
} from '../data/initialData.ts';
import { Position, Transaction, Dividend, BrokerBalance } from '../types.ts';

// Get all positions with their broker allocations
export async function getPositions(userId?: number): Promise<Position[]> {
  try {
    const rows = userId
      ? await db.select().from(positions).where(eq(positions.userId, userId))
      : await db.select().from(positions);

    const allocations = await db.select().from(brokerAllocations);

    return rows.map((p) => {
      const pAllocations = allocations
        .filter((a) => a.positionId === p.id)
        .map((a) => ({
          broker: a.broker as any,
          brokerFullName: a.brokerFullName,
          quantity: a.quantity,
          valueBrl: a.valueBrl,
          valueUsd: a.valueUsd,
        }));

      return {
        id: p.id,
        ticker: p.ticker,
        name: p.name,
        market: p.market as any,
        assetClass: p.assetClass as any,
        currentPrice: p.currentPrice,
        currentPriceCurrency: p.currentPriceCurrency as any,
        avgPrice: p.avgPrice,
        totalQuantity: p.totalQuantity,
        quantityUnitLabel: p.quantityUnitLabel || undefined,
        targetPercent: p.targetPercent || 0,
        currentPercent: p.currentPercent || 0,
        dayChangePercent: p.dayChangePercent || 0,
        totalProfitLoss: p.totalProfitLoss || 0,
        totalProfitLossPercent: p.totalProfitLossPercent || 0,
        statusLabel: p.statusLabel || undefined,
        brokerBreakdown: pAllocations,
      };
    });
  } catch (error) {
    console.error('Database getPositions failed:', error);
    throw new Error('Failed to query positions', { cause: error });
  }
}

// Upsert a position
export async function savePosition(item: Position, userId?: number): Promise<Position> {
  try {
    await db
      .insert(positions)
      .values({
        id: item.id,
        userId: userId || null,
        ticker: item.ticker,
        name: item.name,
        market: item.market,
        assetClass: item.assetClass,
        currentPrice: item.currentPrice,
        currentPriceCurrency: item.currentPriceCurrency,
        avgPrice: item.avgPrice,
        totalQuantity: item.totalQuantity,
        quantityUnitLabel: item.quantityUnitLabel || 'COTAS',
        targetPercent: item.targetPercent || 0,
        currentPercent: item.currentPercent || 0,
        dayChangePercent: item.dayChangePercent || 0,
        totalProfitLoss: item.totalProfitLoss || 0,
        totalProfitLossPercent: item.totalProfitLossPercent || 0,
        statusLabel: item.statusLabel || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: positions.id,
        set: {
          ticker: item.ticker,
          name: item.name,
          market: item.market,
          assetClass: item.assetClass,
          currentPrice: item.currentPrice,
          currentPriceCurrency: item.currentPriceCurrency,
          avgPrice: item.avgPrice,
          totalQuantity: item.totalQuantity,
          quantityUnitLabel: item.quantityUnitLabel || 'COTAS',
          targetPercent: item.targetPercent || 0,
          currentPercent: item.currentPercent || 0,
          dayChangePercent: item.dayChangePercent || 0,
          totalProfitLoss: item.totalProfitLoss || 0,
          totalProfitLossPercent: item.totalProfitLossPercent || 0,
          statusLabel: item.statusLabel || null,
          updatedAt: new Date(),
        },
      });

    // Delete existing allocations and re-insert
    await db.delete(brokerAllocations).where(eq(brokerAllocations.positionId, item.id));

    if (item.brokerBreakdown && item.brokerBreakdown.length > 0) {
      await db.insert(brokerAllocations).values(
        item.brokerBreakdown.map((alloc) => ({
          positionId: item.id,
          broker: alloc.broker,
          brokerFullName: alloc.brokerFullName,
          quantity: alloc.quantity,
          valueBrl: alloc.valueBrl,
          valueUsd: alloc.valueUsd,
        }))
      );
    }

    return item;
  } catch (error) {
    console.error('Database savePosition failed:', error);
    throw new Error('Failed to save position', { cause: error });
  }
}

// Delete position
export async function deletePosition(id: string): Promise<boolean> {
  try {
    await db.delete(positions).where(eq(positions.id, id));
    return true;
  } catch (error) {
    console.error('Database deletePosition failed:', error);
    throw new Error('Failed to delete position', { cause: error });
  }
}

// Get transactions
export async function getTransactions(userId?: number): Promise<Transaction[]> {
  try {
    const rows = userId
      ? await db.select().from(transactions).where(eq(transactions.userId, userId))
      : await db.select().from(transactions);

    return rows.map((t) => ({
      id: t.id,
      type: t.type as any,
      ticker: t.ticker,
      name: t.name,
      market: t.market as any,
      assetClass: t.assetClass as any,
      broker: t.broker as any,
      date: t.date,
      quantity: t.quantity,
      price: t.price,
      currency: t.currency as any,
      fees: t.fees || 0,
      total: t.total,
      timestamp: t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
    }));
  } catch (error) {
    console.error('Database getTransactions failed:', error);
    throw new Error('Failed to query transactions', { cause: error });
  }
}

// Add transaction
export async function addTransaction(tx: Transaction, userId?: number): Promise<Transaction> {
  try {
    await db.insert(transactions).values({
      id: tx.id,
      userId: userId || null,
      type: tx.type,
      ticker: tx.ticker,
      name: tx.name,
      market: tx.market,
      assetClass: tx.assetClass,
      broker: tx.broker,
      date: tx.date,
      quantity: tx.quantity,
      price: tx.price,
      currency: tx.currency,
      fees: tx.fees,
      total: tx.total,
      createdAt: new Date(tx.timestamp || Date.now()),
    });
    return tx;
  } catch (error) {
    console.error('Database addTransaction failed:', error);
    throw new Error('Failed to add transaction', { cause: error });
  }
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    await db.delete(transactions).where(eq(transactions.id, id));
    return true;
  } catch (error) {
    console.error('Database deleteTransaction failed:', error);
    throw new Error('Failed to delete transaction', { cause: error });
  }
}

// Get dividends
export async function getDividends(userId?: number): Promise<Dividend[]> {
  try {
    const rows = userId
      ? await db.select().from(dividends).where(eq(dividends.userId, userId))
      : await db.select().from(dividends);

    return rows.map((d) => ({
      id: d.id,
      ticker: d.ticker,
      assetClass: d.assetClass as any,
      broker: d.broker as any,
      market: d.market as any,
      perShare: d.perShare,
      quantity: d.quantity,
      paymentDate: d.paymentDate,
      status: d.status as any,
      totalAmount: d.totalAmount,
      currency: d.currency as any,
      grossAmount: d.grossAmount || undefined,
      taxDeduction: d.taxDeduction || undefined,
      notes: d.notes || undefined,
    }));
  } catch (error) {
    console.error('Database getDividends failed:', error);
    throw new Error('Failed to query dividends', { cause: error });
  }
}

// Add dividend
export async function addDividend(div: Dividend, userId?: number): Promise<Dividend> {
  try {
    await db.insert(dividends).values({
      id: div.id,
      userId: userId || null,
      ticker: div.ticker,
      assetClass: div.assetClass,
      broker: div.broker,
      market: div.market,
      perShare: div.perShare,
      quantity: div.quantity,
      paymentDate: div.paymentDate,
      status: div.status,
      totalAmount: div.totalAmount,
      currency: div.currency,
      grossAmount: div.grossAmount || null,
      taxDeduction: div.taxDeduction || null,
      notes: div.notes || null,
    });
    return div;
  } catch (error) {
    console.error('Database addDividend failed:', error);
    throw new Error('Failed to add dividend', { cause: error });
  }
}

// Delete dividend
export async function deleteDividend(id: string): Promise<boolean> {
  try {
    await db.delete(dividends).where(eq(dividends.id, id));
    return true;
  } catch (error) {
    console.error('Database deleteDividend failed:', error);
    throw new Error('Failed to delete dividend', { cause: error });
  }
}

// Get broker balances
export async function getBrokerBalances(userId?: number): Promise<BrokerBalance[]> {
  try {
    const rows = userId
      ? await db.select().from(brokerBalances).where(eq(brokerBalances.userId, userId))
      : await db.select().from(brokerBalances);

    if (rows.length === 0) {
      return INITIAL_BROKER_BALANCES;
    }

    return rows.map((b) => ({
      id: b.broker as any,
      name: b.name,
      currency: b.currency as any,
      total: b.total,
      freeCash: b.freeCash,
      status: b.status as any,
    }));
  } catch (error) {
    console.error('Database getBrokerBalances failed:', error);
    return INITIAL_BROKER_BALANCES;
  }
}

// Seed initial data if tables are empty
export async function seedIfEmpty(): Promise<void> {
  try {
    const currentPositions = await db.select().from(positions);
    if (currentPositions.length === 0) {
      console.log('Seeding initial positions into PostgreSQL...');
      for (const pos of INITIAL_POSITIONS) {
        await savePosition(pos);
      }
    }

    const currentTx = await db.select().from(transactions);
    if (currentTx.length === 0) {
      console.log('Seeding initial transactions into PostgreSQL...');
      for (const tx of INITIAL_TRANSACTIONS) {
        await addTransaction(tx);
      }
    }

    const currentDivs = await db.select().from(dividends);
    if (currentDivs.length === 0) {
      console.log('Seeding initial dividends into PostgreSQL...');
      for (const div of INITIAL_DIVIDENDS) {
        await addDividend(div);
      }
    }

    const currentBalances = await db.select().from(brokerBalances);
    if (currentBalances.length === 0) {
      console.log('Seeding initial broker balances into PostgreSQL...');
      for (const b of INITIAL_BROKER_BALANCES) {
        await db.insert(brokerBalances).values({
          broker: b.id,
          name: b.name,
          currency: b.currency,
          total: b.total,
          freeCash: b.freeCash,
          status: b.status,
        });
      }
    }
  } catch (error) {
    console.error('Seeding database warning (will retry on demand):', error);
  }
}
