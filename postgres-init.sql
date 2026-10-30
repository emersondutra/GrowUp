-- ========================================================
-- GROWUP INVESTMENT TRACKER - POSTGRESQL INITIALIZATION
-- Script de inicialização para VPS / Docker / PostgreSQL 16
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários (Admin e Clientes)
CREATE TABLE IF NOT EXISTS users (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserção do Usuário Administrador Obrigatório
INSERT INTO users (full_name, name, email, cpf, role, status, display_name)
VALUES ('Emerson Rocha Dutra', 'Emerson', 'emerson.dutra@gmail.com', '01576230171', 'admin', 'ativo', 'Emerson Rocha Dutra')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    cpf = EXCLUDED.cpf,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 2. Tabela de Posições / Ativos da Carteira
CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Alocação por Corretora dos Ativos
CREATE TABLE IF NOT EXISTS broker_allocations (
    id SERIAL PRIMARY KEY,
    position_id TEXT NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    broker TEXT NOT NULL,
    broker_full_name TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    value_brl DOUBLE PRECISION NOT NULL,
    value_usd DOUBLE PRECISION NOT NULL
);

-- 4. Tabela de Transações / Ordens de Compra e Venda
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Proventos / Dividendos e JCP
CREATE TABLE IF NOT EXISTS dividends (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Saldos e Custódias por Corretora
CREATE TABLE IF NOT EXISTS broker_balances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    broker TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    total DOUBLE PRECISION NOT NULL DEFAULT 0,
    free_cash DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'connected',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de Otimização
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_dividends_ticker ON dividends(ticker);
