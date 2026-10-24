import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  Wallet,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  Edit2,
} from 'lucide-react';
import { BrokerBalance, Currency, DailyMover, Dividend, Market, Position } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { GoogleFinanceBar } from '../components/GoogleFinanceBar';
import { TabKey } from '../components/BottomNav';

interface DashboardScreenProps {
  positions: Position[];
  dividends: Dividend[];
  currency: Currency;
  onToggleCurrency: (c: Currency) => void;
  hideValues: boolean;
  onToggleHideValues: () => void;
  brokerBalances: BrokerBalance[];
  dailyMovers: DailyMover[];
  fxRate: number;
  dollarChangePercent?: number;
  lastUpdated: Date;
  isUpdatingQuotes: boolean;
  onRefreshQuotes: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  onNavigateTab: (tab: TabKey) => void;
  onOpenRemessaModal: () => void;
  onAddNewBroker?: () => void;
  onEditBroker?: (broker: BrokerBalance) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  positions,
  dividends,
  currency,
  onToggleCurrency,
  hideValues,
  onToggleHideValues,
  brokerBalances,
  dailyMovers,
  fxRate,
  dollarChangePercent = 0.9,
  lastUpdated,
  isUpdatingQuotes,
  onRefreshQuotes,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onNavigateTab,
  onOpenRemessaModal,
  onAddNewBroker,
  onEditBroker,
}) => {
  const [moverFilter, setMoverFilter] = useState<'ALL' | 'BR' | 'US'>('ALL');

  // 1. Dynamic Positions and Cash aggregation
  const brPositionsVal = positions
    .filter((p) => p.market === 'BR')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity, 0);

  const usPositionsValUsd = positions
    .filter((p) => p.market === 'US')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity, 0);

  const brCash = brokerBalances
    .filter((b) => b.currency === 'BRL')
    .reduce((acc, b) => acc + b.freeCash, 0);

  const usCashUsd = brokerBalances
    .filter((b) => b.currency === 'USD')
    .reduce((acc, b) => acc + b.freeCash, 0);

  const brTotalBrl = brPositionsVal + brCash;
  const usTotalUsd = usPositionsValUsd + usCashUsd;
  const usTotalBrl = usTotalUsd * fxRate;

  // Master Consolidated Wealth
  const consolidatedBrl = brTotalBrl + usTotalBrl;
  const consolidatedUsd = consolidatedBrl / fxRate;

  // Geographic percentages
  const brPercent = consolidatedBrl > 0 ? Math.round((brTotalBrl / consolidatedBrl) * 100) : 58;
  const usPercent = 100 - brPercent;

  // 2. Asset Classes Dynamic Breakdown
  const totalAssetsValBrl = brPositionsVal + usPositionsValUsd * fxRate || 1;

  const acoesVal = positions
    .filter((p) => p.assetClass === 'Ação')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity, 0);
  const stocksVal = positions
    .filter((p) => p.assetClass === 'Stock')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity * fxRate, 0);
  const fiisVal = positions
    .filter((p) => p.assetClass === 'FII')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity, 0);
  const reitsVal = positions
    .filter((p) => p.assetClass === 'REIT')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity * fxRate, 0);
  const etfsVal = positions
    .filter((p) => p.assetClass === 'ETF')
    .reduce((acc, p) => acc + p.currentPrice * p.totalQuantity, 0);

  const acoesPct = Math.round((acoesVal / totalAssetsValBrl) * 100);
  const stocksPct = Math.round((stocksVal / totalAssetsValBrl) * 100);
  const fiisPct = Math.round((fiisVal / totalAssetsValBrl) * 100);
  const reitsPct = Math.round((reitsVal / totalAssetsValBrl) * 100);
  const etfsPct = Math.max(0, 100 - (acoesPct + stocksPct + fiisPct + reitsPct));

  // 3. Proventos no Mês Dynamic Aggregation
  const brlDividendsMonth = dividends
    .filter((d) => d.currency === 'BRL')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  const usdDividendsMonth = dividends
    .filter((d) => d.currency === 'USD')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  const nextDiv = dividends[0] || {
    ticker: 'HGLG11',
    paymentDate: '14/Nov',
    totalAmount: 275.0,
    currency: 'BRL',
  };

  // 4. Filtered daily movers
  const filteredMovers = dailyMovers.filter((m) => {
    if (moverFilter === 'BR') return m.market === 'BR';
    if (moverFilter === 'US') return m.market === 'US';
    return true;
  });

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* 0. Live Google Finance Telemetry Bar */}
      <GoogleFinanceBar
        fxRate={fxRate}
        dollarChangePercent={dollarChangePercent}
        lastUpdated={lastUpdated}
        isUpdating={isUpdatingQuotes}
        onRefresh={onRefreshQuotes}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={onToggleAutoRefresh}
      />

      {/* 1. Master Consolidated Equity Card */}
      <div className="bg-gradient-to-b from-[#0f1d2e] via-[#0b1726] to-[#07111c] border border-[#1e293b] rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#38bdf8]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase font-display">
              Patrimônio Consolidado
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleHideValues}
              className="p-1 rounded-md text-[#94a3b8] hover:text-[#d4e4fa] hover:bg-[#162032] transition-colors cursor-pointer"
              title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {hideValues ? <EyeOff className="w-3.5 h-3.5 text-[#ffb95f]" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Currency Mini Switcher */}
            <div className="bg-[#051424] p-0.5 rounded-lg border border-[#1e293b] flex items-center">
              <button
                type="button"
                onClick={() => onToggleCurrency('BRL')}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded font-mono-numbers transition-all cursor-pointer ${
                  currency === 'BRL'
                    ? 'bg-[#38bdf8] text-[#051424]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                BRL
              </button>
              <button
                type="button"
                onClick={() => onToggleCurrency('USD')}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded font-mono-numbers transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-[#38bdf8] text-[#051424]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                USD
              </button>
            </div>
          </div>
        </div>

        {/* Big Balance Headline */}
        <div className="my-1.5">
          <div className="text-3xl sm:text-[34px] font-bold text-white tracking-tight font-display font-mono-numbers leading-none">
            {currency === 'BRL'
              ? formatCurrency(consolidatedBrl, 'BRL', hideValues, true)
              : formatCurrency(consolidatedUsd, 'USD', hideValues, true)}
          </div>
          <div className="text-xs text-[#94a3b8] mt-1 font-mono-numbers flex items-center gap-1.5">
            {currency === 'BRL' ? (
              <>
                <span>Equiv. {formatCurrency(consolidatedUsd, 'USD', hideValues, true)}</span>
                <span>•</span>
                <span>FX R$ {fxRate.toFixed(2).replace('.', ',')}</span>
              </>
            ) : (
              <>
                <span>Equiv. {formatCurrency(consolidatedBrl, 'BRL', hideValues, true)}</span>
                <span>•</span>
                <span>FX R$ {fxRate.toFixed(2).replace('.', ',')}</span>
              </>
            )}
          </div>
        </div>

        {/* 2 Nested Telemetry Cards */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-[#1e293b]/80">
          <div className="bg-[#051424]/80 border border-[#1e293b] rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[#94a3b8] text-[11px] font-medium">
              <span>No Ano (2025)</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
            </div>
            <div className="mt-1 flex items-baseline gap-1 font-mono-numbers">
              <span className="text-sm font-bold text-[#10b981]">+18,4%</span>
              <span className="text-[11px] text-[#56e5a9]/80 font-medium">
                {hideValues ? '(+••••)' : '(+R$ 131k)'}
              </span>
            </div>
          </div>

          <div className="bg-[#051424]/80 border border-[#1e293b] rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[#94a3b8] text-[11px] font-medium">
              <span>Variação Hoje</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#10b981]" />
            </div>
            <div className="mt-1 flex items-baseline gap-1 font-mono-numbers">
              <span className="text-sm font-bold text-[#10b981]">+0,84%</span>
              <span className="text-[11px] text-[#56e5a9]/80 font-medium">
                {hideValues ? '(+••••)' : '(+R$ 7.025)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Alocação Geográfica (Cross-Border - Dynamic) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white font-display">Alocação Geográfica</h2>
          <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider font-display">
            Cross-Border
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Brasil Card */}
          <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🇧🇷</span>
                <span className="text-xs font-bold text-white font-display">Brasil</span>
              </div>
              <span className="bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 text-[10px] font-bold font-mono-numbers px-1.5 py-0.5 rounded">
                {brPercent}%
              </span>
            </div>
            <div className="text-[11px] text-[#94a3b8]">Posição B3 + Caixa</div>
            <div className="text-sm font-bold text-white font-mono-numbers mt-0.5">
              {formatCurrency(brTotalBrl, 'BRL', hideValues)}
            </div>
            <div className="text-[11px] text-[#10b981] font-mono-numbers font-medium mt-1 flex items-center gap-0.5">
              <span>↑</span>
              <span>+14,2% a.a.</span>
            </div>
          </div>

          {/* EUA Card */}
          <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🇺🇸</span>
                <span className="text-xs font-bold text-white font-display">EUA</span>
              </div>
              <span className="bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30 text-[10px] font-bold font-mono-numbers px-1.5 py-0.5 rounded">
                {usPercent}%
              </span>
            </div>
            <div className="text-[11px] text-[#94a3b8]">Wall St. (Offshore)</div>
            <div className="text-sm font-bold text-white font-mono-numbers mt-0.5">
              {formatCurrency(usTotalUsd, 'USD', hideValues)}
            </div>
            <div className="text-[11px] text-[#10b981] font-mono-numbers font-medium mt-1 flex items-center gap-0.5">
              <span>↑</span>
              <span>+22,8% USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Classes de Ativos (Dynamic from positions) */}
      <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-[#38bdf8]/40 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
            </div>
            <h3 className="text-xs font-bold text-white font-display">Classes de Ativos</h3>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono-numbers font-medium">
            5 Categorias
          </span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5 bg-[#051424] mb-3">
          <div style={{ width: `${acoesPct}%` }} className="h-full bg-[#38bdf8] rounded-l-full" title={`Ações BR ${acoesPct}%`} />
          <div style={{ width: `${stocksPct}%` }} className="h-full bg-[#f59e0b]" title={`Stocks ${stocksPct}%`} />
          <div style={{ width: `${fiisPct}%` }} className="h-full bg-[#10b981]" title={`FIIs ${fiisPct}%`} />
          <div style={{ width: `${reitsPct}%` }} className="h-full bg-[#fbbf24]" title={`REITs ${reitsPct}%`} />
          <div style={{ width: `${etfsPct}%` }} className="h-full bg-[#818cf8] rounded-r-full" title={`ETFs ${etfsPct}%`} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span className="text-[#94a3b8]">Ações BR</span>
            <span className="font-mono-numbers font-bold text-white">{acoesPct}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-[#94a3b8]">Stocks</span>
            <span className="font-mono-numbers font-bold text-white">{stocksPct}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[#94a3b8]">FIIs</span>
            <span className="font-mono-numbers font-bold text-white">{fiisPct}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
            <span className="text-[#94a3b8]">REITs</span>
            <span className="font-mono-numbers font-bold text-white">{reitsPct}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#818cf8]" />
            <span className="text-[#94a3b8]">ETFs</span>
            <span className="font-mono-numbers font-bold text-white">{etfsPct}%</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('raiox')}
            className="text-[11px] font-bold text-[#38bdf8] hover:text-[#7bd0ff] transition-colors ml-auto font-display hover:underline cursor-pointer"
          >
            Rebalancear
          </button>
        </div>
      </div>

      {/* 4. Proventos no Mês (Dynamic from dividends) */}
      <div className="bg-gradient-to-br from-[#1c1d12] via-[#15191c] to-[#0d1622] border border-[#f59e0b]/30 rounded-xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center text-[#ffb95f]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-display">Proventos no Mês</h3>
              <span className="text-[10px] text-[#94a3b8]">Previsão e Próximos Pagamentos</span>
            </div>
          </div>
          <span className="bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-display">
            Agendados
          </span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              Total Previsto
            </div>
            <div className="text-lg font-bold text-[#ffb95f] font-mono-numbers">
              {hideValues ? '••••••' : formatCurrency(brlDividendsMonth, 'BRL')}{' '}
              <span className="text-xs font-medium text-[#d4e4fa]">
                {hideValues ? '' : `+ ${formatCurrency(usdDividendsMonth, 'USD')}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('proventos')}
            className="py-1.5 px-3 bg-[#1e293b] hover:bg-[#273647] border border-[#3e484f] text-[#d4e4fa] text-xs font-semibold rounded-lg font-display flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Agenda</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          </button>
        </div>

        {/* Highlighted next payout */}
        <div className="mt-2.5 pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono-numbers bg-[#051424]/60 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#56e5a9] text-[10px] font-bold border border-[#10b981]/30">
              {nextDiv.ticker}
            </span>
            <span className="text-[#94a3b8] text-[11px]">Previsto p/ {nextDiv.paymentDate}</span>
          </div>
          <span className="text-[#10b981] font-bold">
            {hideValues ? '••••••' : formatCurrency(nextDiv.totalAmount, nextDiv.currency)}
          </span>
        </div>
      </div>

      {/* 5. Custódia & Saldos (Dynamic CRUD) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white font-display">Custódia & Saldos</h2>
            <div className="flex items-center gap-1 text-[10px] font-mono-numbers text-[#10b981] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span>{brokerBalances.length} Conectadas</span>
            </div>
          </div>

          {onAddNewBroker && (
            <button
              type="button"
              onClick={onAddNewBroker}
              className="py-1 px-2.5 bg-[#162032] hover:bg-[#1e293b] border border-[#1e293b] hover:border-[#38bdf8]/50 text-[#38bdf8] text-[11px] font-bold rounded-lg font-display flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Conectar</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {brokerBalances.map((broker) => (
            <div
              key={broker.id}
              onClick={() => onEditBroker && onEditBroker(broker)}
              className="bg-[#0d1c2d] hover:bg-[#122131] border border-[#1e293b] hover:border-[#38bdf8]/40 rounded-xl p-3 relative cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white font-display truncate">
                  {broker.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#94a3b8] font-mono-numbers font-semibold">
                    {broker.currency}
                  </span>
                  <Edit2 className="w-2.5 h-2.5 text-[#94a3b8] group-hover:text-[#38bdf8] transition-colors" />
                </div>
              </div>

              <div className="text-sm font-bold text-white font-mono-numbers">
                {formatCurrency(broker.total, broker.currency, hideValues)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#94a3b8] mt-1.5 font-mono-numbers">
                <span>
                  {broker.currency === 'BRL' ? 'Livre:' : 'Cash:'}{' '}
                  {formatCurrency(broker.freeCash, broker.currency, hideValues, false)}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Movimentações do Dia */}
      <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
            <h3 className="text-xs font-bold text-white font-display">Movimentações do Dia</h3>
          </div>

          {/* Filter: Todos | BR | US */}
          <div className="bg-[#051424] p-0.5 rounded-lg border border-[#1e293b] flex items-center">
            {(['ALL', 'BR', 'US'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setMoverFilter(filter)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded font-display transition-all cursor-pointer ${
                  moverFilter === filter
                    ? 'bg-[#1c2b3c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'Todos' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filteredMovers.map((mover) => {
            const isPositive = mover.changePercent >= 0;
            return (
              <div
                key={mover.ticker}
                className="p-2.5 bg-[#051424] hover:bg-[#122131] border border-[#1e293b] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                onClick={() => onNavigateTab('carteira')}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center font-display font-bold text-xs text-[#8ed5ff]">
                    {mover.badge}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        {mover.ticker}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#1e293b] text-[#94a3b8] font-bold font-mono-numbers">
                        {mover.assetClass === 'Stock' || mover.assetClass === 'REIT'
                          ? mover.assetClass
                          : mover.market}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94a3b8] truncate">{mover.name}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-white font-mono-numbers">
                    {formatCurrency(mover.price, mover.currency, hideValues)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold font-mono-numbers px-1.5 py-0.5 rounded mt-0.5 ${
                      isPositive
                        ? 'bg-[#10b981]/15 text-[#56e5a9]'
                        : 'bg-[#ef4444]/15 text-[#ffb4ab]'
                    }`}
                  >
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>{formatPercent(mover.changePercent, false)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom Quick Action Triggers */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onNavigateTab('lancar')}
          className="py-3 px-3 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-xl font-display flex items-center justify-center gap-1.5 shadow-lg shadow-[#38bdf8]/15 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Lançamento</span>
        </button>

        <button
          type="button"
          onClick={onOpenRemessaModal}
          className="py-3 px-3 bg-[#122131] hover:bg-[#1c2b3c] border border-[#1e293b] text-[#d4e4fa] font-bold text-xs rounded-xl font-display flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4 text-[#38bdf8]" />
          <span>Câmbio / Remessa</span>
        </button>
      </div>
    </div>
  );
};
