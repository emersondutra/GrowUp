export type Currency = 'BRL' | 'USD';

export type Market = 'BR' | 'US';

export type AssetClass = 'Ação' | 'FII' | 'Stock' | 'ETF' | 'REIT' | 'BDR';

export type Broker = 'XP' | 'Avenue' | 'NuInvest' | 'IBKR' | 'BTG' | 'Schwab';

export interface BrokerAllocation {
  broker: Broker;
  brokerFullName: string;
  quantity: number;
  valueBrl: number;
  valueUsd: number;
}

export interface Position {
  id: string;
  ticker: string;
  name: string;
  market: Market;
  assetClass: AssetClass;
  currentPrice: number;
  currentPriceCurrency: Currency;
  avgPrice: number;
  totalQuantity: number;
  quantityUnitLabel?: string; // 'AÇÕES' | 'COTAS' | 'STOCKS'
  targetPercent: number;
  currentPercent: number;
  dayChangePercent: number;
  brokerBreakdown: BrokerAllocation[];
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  statusLabel?: string; // 'Em meta' | 'Sobreponderado' | 'Alinhado' | 'Oportunidade aporte'
}

export type DividendStatus = 'CONFIRMADO' | 'PROVISIONADO' | 'APROVADO AGE' | 'MENSAL';

export interface Dividend {
  id: string;
  ticker: string;
  assetClass: AssetClass;
  broker: Broker;
  market: Market;
  perShare: number;
  quantity: number;
  paymentDate: string; // e.g. '14/Nov'
  status: DividendStatus;
  totalAmount: number;
  currency: Currency;
  grossAmount?: number;
  taxDeduction?: string; // e.g. '-30% WHT'
  notes?: string;
}

export interface MonthlyDividendFlow {
  month: string;
  year: number;
  realizedBrl?: number;
  projectedBrl?: number;
  isCurrent?: boolean;
}

export interface BrokerBalance {
  id: Broker;
  name: string;
  currency: Currency;
  total: number;
  freeCash: number;
  status: 'connected' | 'syncing' | 'offline';
}

export interface DailyMover {
  ticker: string;
  badge: string;
  name: string;
  market: Market;
  assetClass: AssetClass;
  price: number;
  currency: Currency;
  changePercent: number;
}

export type OperationType = 'COMPRA' | 'VENDA' | 'PROVENTO';

export interface Transaction {
  id: string;
  type: OperationType;
  ticker: string;
  name: string;
  market: Market;
  assetClass: AssetClass;
  broker: Broker;
  date: string;
  quantity: number;
  price: number;
  currency: Currency;
  fees: number;
  total: number;
  timestamp: number;
}

export type UserRole = 'admin' | 'cliente';

export interface AppUser {
  id: number;
  uid?: string | null;
  fullName: string;
  name: string;
  email: string;
  cpf?: string | null;
  role: UserRole;
  status: 'ativo' | 'inativo';
  displayName?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
