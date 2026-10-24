-- ========================================================
-- GROWUP INVESTMENT TRACKER - SUPABASE / POSTGRESQL MIGRATION
-- Copie e cole este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- 1. Habilitar extensões
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

-- 4. Tabela de Transações / Ordens de Compra e Venda
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

-- 5. Tabela de Proventos / Dividendos e JCP
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

-- 6. Tabela de Saldos e Custódias por Corretora
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

-- 7. Tabela de Alocação por Corretora dos Ativos
CREATE TABLE IF NOT EXISTS public.broker_allocations (
    id BIGSERIAL PRIMARY KEY,
    position_id TEXT NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    broker TEXT NOT NULL,
    broker_full_name TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    value_brl DOUBLE PRECISION NOT NULL,
    value_usd DOUBLE PRECISION NOT NULL
);

-- 8. Configuração de Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_allocations ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura e escrita com chave anon ou autenticado
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir select para users" ON public.users;
    DROP POLICY IF EXISTS "Permitir all para users" ON public.users;
    CREATE POLICY "Permitir select para users" ON public.users FOR SELECT USING (true);
    CREATE POLICY "Permitir all para users" ON public.users FOR ALL USING (true);

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

-- 9. Índices de Otimização
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON public.users(cpf);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON public.positions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON public.transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_dividends_ticker ON public.dividends(ticker);

-- 10. Inserção de Carga Inicial Demonstrativa (Opcional)
INSERT INTO public.broker_balances (broker, name, currency, total, free_cash, status)
VALUES
  ('XP', 'XP Investimentos', 'BRL', 125430.50, 4200.00, 'connected'),
  ('BTG', 'BTG Pactual', 'BRL', 65200.80, 1500.00, 'connected'),
  ('AVENUE', 'Avenue Securities', 'USD', 24150.00, 850.00, 'connected'),
  ('INTER', 'Banco Inter Global', 'USD', 8400.00, 320.00, 'connected')
ON CONFLICT (broker) DO NOTHING;
