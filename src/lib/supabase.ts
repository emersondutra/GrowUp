import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Position, Transaction, Dividend, BrokerBalance } from '../types';

// Default / fallback keys from Vite environment variables or LocalStorage
const STORAGE_URL_KEY = 'growup_supabase_url';
const STORAGE_ANON_KEY = 'growup_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  const storedUrl = (localStorage.getItem(STORAGE_URL_KEY) || '').trim();
  const storedKey = (localStorage.getItem(STORAGE_ANON_KEY) || '').trim();

  if (storedUrl && storedKey) {
    return {
      url: storedUrl,
      anonKey: storedKey,
      isConfigured: true,
      source: 'storage',
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (cleanUrl) {
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
  }

  if (cleanKey) {
    localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
  } else {
    localStorage.removeItem(STORAGE_ANON_KEY);
  }

  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Tests connection to the configured Supabase instance
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{
  success: boolean;
  latencyMs?: number;
  message: string;
}> {
  const start = performance.now();
  let client: SupabaseClient | null = null;

  if (customUrl && customKey) {
    try {
      client = createClient(customUrl.trim(), customKey.trim());
    } catch (e: any) {
      return { success: false, message: `URL inválida: ${e.message}` };
    }
  } else {
    client = getSupabaseClient();
  }

  if (!client) {
    return {
      success: false,
      message: 'Supabase não configurado. Forneça o Project URL e Anon Key.',
    };
  }

  try {
    // Attempt a light query to verify credentials and connectivity
    // First try the positions table
    const { error: positionsError } = await client
      .from('positions')
      .select('id')
      .limit(1);

    const latencyMs = Math.round(performance.now() - start);

    if (!positionsError) {
      return {
        success: true,
        latencyMs,
        message: `Conexão bem-sucedida! Tabela 'positions' acessível (${latencyMs}ms).`,
      };
    }

    // If table doesn't exist yet (PGRST204 or 42P01), connection to Supabase itself succeeded, just needs migrations
    if (
      positionsError.code === '42P01' ||
      positionsError.message?.includes('does not exist') ||
      positionsError.message?.includes('relation "public.positions" does not exist')
    ) {
      return {
        success: true,
        latencyMs,
        message: `Conectado ao Supabase! (${latencyMs}ms) As tabelas ainda não foram criadas. Execute o script de Migrations.`,
      };
    }

    // Check for auth or permission error
    if (positionsError.code === 'PGRST301' || positionsError.code === '401' || positionsError.message?.includes('JWT')) {
      return {
        success: false,
        latencyMs,
        message: `Erro de autorização (Anon Key inválida ou expirada): ${positionsError.message}`,
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Supabase respondeu (${latencyMs}ms): ${positionsError.message}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao conectar com o Supabase: ${err.message || err}`,
    };
  }
}

/**
 * Pushes local state to Supabase tables
 */
export async function pushToSupabase(data: {
  positions: Position[];
  transactions: Transaction[];
  dividends: Dividend[];
  balances: BrokerBalance[];
}): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não conectado.' };
  }

  try {
    // 1. Sync Positions
    if (data.positions.length > 0) {
      const formattedPositions = data.positions.map((p) => ({
        id: p.id,
        ticker: p.ticker,
        name: p.name,
        market: p.market,
        asset_class: p.assetClass,
        current_price: p.currentPrice,
        current_price_currency: p.currentPriceCurrency || 'BRL',
        avg_price: p.avgPrice,
        total_quantity: p.totalQuantity,
        quantity_unit_label: p.quantityUnitLabel || 'COTAS',
        target_percent: p.targetPercent || 0,
        current_percent: p.currentPercent || 0,
        day_change_percent: p.dayChangePercent || 0,
        total_profit_loss: p.totalProfitLoss || 0,
        total_profit_loss_percent: p.totalProfitLossPercent || 0,
        status_label: p.statusLabel || 'Aguardar',
        updated_at: new Date().toISOString(),
      }));

      const { error: posErr } = await client
        .from('positions')
        .upsert(formattedPositions, { onConflict: 'id' });

      if (posErr) throw new Error(`Erro em positions: ${posErr.message}`);
    }

    // 2. Sync Transactions
    if (data.transactions.length > 0) {
      const formattedTx = data.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        ticker: t.ticker,
        name: t.name,
        market: t.market,
        asset_class: t.assetClass,
        broker: t.broker,
        date: t.date,
        quantity: t.quantity,
        price: t.price,
        currency: t.currency || 'BRL',
        fees: t.fees || 0,
        total: t.total,
      }));

      const { error: txErr } = await client
        .from('transactions')
        .upsert(formattedTx, { onConflict: 'id' });

      if (txErr) throw new Error(`Erro em transactions: ${txErr.message}`);
    }

    // 3. Sync Dividends
    if (data.dividends.length > 0) {
      const formattedDivs = data.dividends.map((d) => ({
        id: d.id,
        ticker: d.ticker,
        asset_class: d.assetClass,
        broker: d.broker,
        market: d.market,
        per_share: d.perShare,
        quantity: d.quantity,
        payment_date: d.paymentDate,
        status: d.status,
        total_amount: d.totalAmount,
        currency: d.currency || 'BRL',
        gross_amount: d.grossAmount || d.totalAmount,
        tax_deduction: d.taxDeduction || '0%',
        notes: d.notes || '',
      }));

      const { error: divErr } = await client
        .from('dividends')
        .upsert(formattedDivs, { onConflict: 'id' });

      if (divErr) throw new Error(`Erro em dividends: ${divErr.message}`);
    }

    // 4. Sync Broker Balances
    if (data.balances.length > 0) {
      const formattedBalances = data.balances.map((b) => ({
        broker: b.id,
        name: b.name,
        currency: b.currency || 'BRL',
        total: b.total,
        free_cash: b.freeCash,
        status: b.status || 'connected',
        updated_at: new Date().toISOString(),
      }));

      const { error: balErr } = await client
        .from('broker_balances')
        .upsert(formattedBalances, { onConflict: 'broker' });

      if (balErr) throw new Error(`Erro em broker_balances: ${balErr.message}`);
    }

    return {
      success: true,
      message: `${data.positions.length} ativos, ${data.transactions.length} ordens e ${data.dividends.length} proventos sincronizados com o Supabase!`,
    };
  } catch (err: any) {
    console.error('Supabase push error:', err);
    return {
      success: false,
      message: err.message || 'Falha ao sincronizar dados com o Supabase.',
    };
  }
}

/**
 * Pulls portfolio data from Supabase tables into local state format
 */
export async function pullFromSupabase(): Promise<{
  success: boolean;
  positions?: Position[];
  transactions?: Transaction[];
  dividends?: Dividend[];
  balances?: BrokerBalance[];
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não conectado.' };
  }

  try {
    const [posRes, txRes, divRes, balRes] = await Promise.all([
      client.from('positions').select('*'),
      client.from('transactions').select('*').order('date', { ascending: false }),
      client.from('dividends').select('*').order('payment_date', { ascending: false }),
      client.from('broker_balances').select('*'),
    ]);

    if (posRes.error) throw new Error(`Positions: ${posRes.error.message}`);
    if (txRes.error) throw new Error(`Transactions: ${txRes.error.message}`);
    if (divRes.error) throw new Error(`Dividends: ${divRes.error.message}`);

    const positions: Position[] = (posRes.data || []).map((row: any) => ({
      id: row.id,
      ticker: row.ticker,
      name: row.name,
      market: row.market,
      assetClass: row.asset_class,
      currentPrice: Number(row.current_price),
      currentPriceCurrency: row.current_price_currency || 'BRL',
      avgPrice: Number(row.avg_price),
      totalQuantity: Number(row.total_quantity),
      quantityUnitLabel: row.quantity_unit_label || 'COTAS',
      targetPercent: Number(row.target_percent || 0),
      currentPercent: Number(row.current_percent || 0),
      dayChangePercent: Number(row.day_change_percent || 0),
      totalProfitLoss: Number(row.total_profit_loss || 0),
      totalProfitLossPercent: Number(row.total_profit_loss_percent || 0),
      statusLabel: row.status_label || 'Aguardar',
      brokerBreakdown: [],
    }));

    const transactions: Transaction[] = (txRes.data || []).map((row: any) => ({
      id: row.id,
      type: row.type,
      ticker: row.ticker,
      name: row.name,
      market: row.market,
      assetClass: row.asset_class,
      broker: row.broker,
      date: row.date,
      quantity: Number(row.quantity),
      price: Number(row.price),
      currency: row.currency || 'BRL',
      fees: Number(row.fees || 0),
      total: Number(row.total),
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));

    const dividends: Dividend[] = (divRes.data || []).map((row: any) => ({
      id: row.id,
      ticker: row.ticker,
      assetClass: row.asset_class,
      broker: row.broker,
      market: row.market,
      perShare: Number(row.per_share),
      quantity: Number(row.quantity),
      paymentDate: row.payment_date,
      status: row.status,
      totalAmount: Number(row.total_amount),
      currency: row.currency || 'BRL',
      grossAmount: Number(row.gross_amount || row.total_amount),
      taxDeduction: row.tax_deduction || '0%',
      notes: row.notes || '',
    }));

    const balances: BrokerBalance[] = (balRes.data || []).map((row: any) => ({
      id: row.broker as any,
      name: row.name,
      currency: row.currency || 'BRL',
      total: Number(row.total),
      freeCash: Number(row.free_cash),
      status: (row.status as any) || 'connected',
    }));

    return {
      success: true,
      positions,
      transactions,
      dividends,
      balances,
      message: `Dados baixados com sucesso do Supabase (${positions.length} ativos, ${transactions.length} ordens).`,
    };
  } catch (err: any) {
    console.error('Supabase pull error:', err);
    return {
      success: false,
      message: err.message || 'Falha ao buscar dados do Supabase.',
    };
  }
}

export const SUPABASE_MIGRATION_SQL = `-- ========================================================
-- GROWUP INVESTMENT TRACKER - SUPABASE / POSTGRESQL MIGRATION
-- Execute no Supabase SQL Editor (SQL Editor > New Query > Run)
-- ========================================================

-- 1. Enable UUID Extension (se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários (Admin e Clientes)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    uid TEXT UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    cpf TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserção do Usuário Administrador Obrigatório
INSERT INTO public.users (full_name, name, email, cpf, role, status, display_name)
VALUES ('Emerson Rocha Dutra', 'Emerson', 'emerson.dutra@gmail.com', '01576230171', 'admin', 'ativo', 'Emerson Rocha Dutra')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    cpf = EXCLUDED.cpf,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. Tabela de Posições / Ativos da Carteira
CREATE TABLE IF NOT EXISTS public.positions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('BR', 'US')),
    asset_class TEXT NOT NULL,
    current_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    current_price_currency TEXT NOT NULL DEFAULT 'BRL',
    avg_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
    quantity_unit_label TEXT DEFAULT 'COTAS',
    target_percent DOUBLE PRECISION DEFAULT 0,
    current_percent DOUBLE PRECISION DEFAULT 0,
    day_change_percent DOUBLE PRECISION DEFAULT 0,
    total_profit_loss DOUBLE PRECISION DEFAULT 0,
    total_profit_loss_percent DOUBLE PRECISION DEFAULT 0,
    status_label TEXT DEFAULT 'Aguardar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Transações / Ordens de Compra e Venda
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('COMPRA', 'VENDA')),
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('BR', 'US')),
    asset_class TEXT NOT NULL,
    broker TEXT NOT NULL,
    date TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    fees DOUBLE PRECISION DEFAULT 0,
    total DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Proventos / Dividendos e JCP
CREATE TABLE IF NOT EXISTS public.dividends (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    broker TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('BR', 'US')),
    per_share DOUBLE PRECISION NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    payment_date TEXT NOT NULL,
    status TEXT NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    gross_amount DOUBLE PRECISION,
    tax_deduction TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Saldos e Custódias por Corretora
CREATE TABLE IF NOT EXISTS public.broker_balances (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    broker TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    total DOUBLE PRECISION NOT NULL DEFAULT 0,
    free_cash DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'connected',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Alocação por Corretora dos Ativos
CREATE TABLE IF NOT EXISTS public.broker_allocations (
    id BIGSERIAL PRIMARY KEY,
    position_id TEXT NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    broker TEXT NOT NULL,
    broker_full_name TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    value_brl DOUBLE PRECISION NOT NULL,
    value_usd DOUBLE PRECISION NOT NULL
);

-- 7. Configuração de Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_allocations ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para leitura e escrita (acesso com anon key e autenticado)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir select para anon e autenticados" ON public.positions;
    DROP POLICY IF EXISTS "Permitir insert/update/delete para anon e autenticados" ON public.positions;
    
    CREATE POLICY "Permitir select para anon e autenticados" ON public.positions FOR SELECT USING (true);
    CREATE POLICY "Permitir insert/update/delete para anon e autenticados" ON public.positions FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir select para transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Permitir all para transactions" ON public.transactions;
    CREATE POLICY "Permitir select para transactions" ON public.transactions FOR SELECT USING (true);
    CREATE POLICY "Permitir all para transactions" ON public.transactions FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir select para dividends" ON public.dividends;
    DROP POLICY IF EXISTS "Permitir all para dividends" ON public.dividends;
    CREATE POLICY "Permitir select para dividends" ON public.dividends FOR SELECT USING (true);
    CREATE POLICY "Permitir all para dividends" ON public.dividends FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir select para broker_balances" ON public.broker_balances;
    DROP POLICY IF EXISTS "Permitir all para broker_balances" ON public.broker_balances;
    CREATE POLICY "Permitir select para broker_balances" ON public.broker_balances FOR SELECT USING (true);
    CREATE POLICY "Permitir all para broker_balances" ON public.broker_balances FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir select para broker_allocations" ON public.broker_allocations;
    DROP POLICY IF EXISTS "Permitir all para broker_allocations" ON public.broker_allocations;
    CREATE POLICY "Permitir select para broker_allocations" ON public.broker_allocations FOR SELECT USING (true);
    CREATE POLICY "Permitir all para broker_allocations" ON public.broker_allocations FOR ALL USING (true);
END
$$;

-- 8. Índices de Otimização
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON public.positions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON public.transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_dividends_ticker ON public.dividends(ticker);
`;
