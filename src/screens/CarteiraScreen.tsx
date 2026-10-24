import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Building2,
  Globe2,
  TrendingUp,
  Plus,
  RefreshCw,
  Edit2,
  Zap,
} from 'lucide-react';
import { AssetClass, Broker, Currency, Market, Position } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface CarteiraScreenProps {
  positions: Position[];
  currency: Currency;
  hideValues: boolean;
  fxRate: number;
  onNavigateLancar: (preselectedTicker?: string) => void;
  onRefreshSync?: () => void;
  onAddNewAsset: () => void;
  onEditAsset: (pos: Position) => void;
  onDeleteAsset?: (id: string) => void;
  isUpdatingQuotes?: boolean;
}

export const CarteiraScreen: React.FC<CarteiraScreenProps> = ({
  positions,
  currency,
  hideValues,
  fxRate,
  onNavigateLancar,
  onRefreshSync,
  onAddNewAsset,
  onEditAsset,
  onDeleteAsset,
  isUpdatingQuotes = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<'ALL' | 'BR' | 'US'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [selectedBroker, setSelectedBroker] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<'value' | 'profit' | 'target'>('value');

  // Filter positions
  const filteredPositions = positions.filter((pos) => {
    // Search
    if (
      searchQuery &&
      !pos.ticker.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !pos.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Country
    if (selectedCountry === 'BR' && pos.market !== 'BR') return false;
    if (selectedCountry === 'US' && pos.market !== 'US') return false;

    // Type
    if (selectedType !== 'TODOS' && pos.assetClass.toUpperCase() !== selectedType.toUpperCase()) {
      return false;
    }

    // Broker
    if (selectedBroker !== 'Todas') {
      const hasBroker = pos.brokerBreakdown.some((b) => b.broker === selectedBroker);
      if (!hasBroker) return false;
    }

    return true;
  });

  // Calculate dynamic totals from active positions
  const totalBrl = positions.reduce((acc, p) => {
    const val = p.currentPriceCurrency === 'USD' ? p.currentPrice * p.totalQuantity * fxRate : p.currentPrice * p.totalQuantity;
    return acc + val;
  }, 0);

  const totalUsd = totalBrl / fxRate;

  const totalUnrealizedProfitBrl = positions.reduce((acc, p) => {
    const profit = p.currentPriceCurrency === 'USD' ? p.totalProfitLoss * fxRate : p.totalProfitLoss;
    return acc + profit;
  }, 0);

  const totalInvestedBrl = totalBrl - totalUnrealizedProfitBrl;
  const overallProfitPercent = totalInvestedBrl > 0 ? (totalUnrealizedProfitBrl / totalInvestedBrl) * 100 : 22.4;

  return (
    <div className="space-y-4 pb-36 pt-2">
      {/* 1. Header Card: PATRIMÔNIO EM ATIVOS */}
      <div className="bg-gradient-to-b from-[#0f1d2e] via-[#0b1726] to-[#07111c] border border-[#1e293b] rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase font-display">
              Patrimônio em Ativos
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#10b981] text-xs font-mono-numbers font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{formatPercent(overallProfitPercent)} Geral</span>
          </div>
        </div>

        <div className="my-1.5">
          <div className="text-3xl sm:text-[34px] font-bold text-white tracking-tight font-display font-mono-numbers leading-none">
            {currency === 'BRL'
              ? formatCurrency(totalBrl, 'BRL', hideValues)
              : formatCurrency(totalUsd, 'USD', hideValues)}
          </div>
          <div className="text-xs text-[#94a3b8] mt-1 font-mono-numbers flex items-center gap-1">
            <span>
              Equiv. {currency === 'BRL' ? formatCurrency(totalUsd, 'USD', hideValues) : formatCurrency(totalBrl, 'BRL', hideValues)} • {positions.length} Posições ativas
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-bold ml-1">
              <Zap className="w-2.5 h-2.5" /> Google Finance
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${totalUnrealizedProfitBrl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {hideValues ? '••••••' : formatCurrency(totalUnrealizedProfitBrl, 'BRL')}
            </span>
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider font-display">
              Lucro Não Realizado
            </span>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onAddNewAsset}
            className="py-1 px-2.5 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] text-[11px] font-bold rounded-lg font-display flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Novo Ativo</span>
          </button>
        </div>

        {/* Broker Breakdown Quick Badges */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-[#1e293b]/70">
          <div className="bg-[#051424] border border-[#1e293b] rounded-lg p-1.5 text-center">
            <span className="block text-[10px] text-[#94a3b8] font-bold font-display">XP</span>
            <span className="text-xs font-bold text-white font-mono-numbers">41%</span>
          </div>
          <div className="bg-[#051424] border border-[#1e293b] rounded-lg p-1.5 text-center">
            <span className="block text-[10px] text-[#94a3b8] font-bold font-display">Avenue</span>
            <span className="text-xs font-bold text-white font-mono-numbers">32%</span>
          </div>
          <div className="bg-[#051424] border border-[#1e293b] rounded-lg p-1.5 text-center">
            <span className="block text-[10px] text-[#94a3b8] font-bold font-display">NuInvest</span>
            <span className="text-xs font-bold text-white font-mono-numbers">19%</span>
          </div>
          <div className="bg-[#051424] border border-[#1e293b] rounded-lg p-1.5 text-center">
            <span className="block text-[10px] text-[#94a3b8] font-bold font-display">IBKR</span>
            <span className="text-xs font-bold text-white font-mono-numbers">8%</span>
          </div>
        </div>
      </div>

      {/* 2. Search, Add & Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ticker (ex: AAPL, PETR4)..."
            className="w-full bg-[#0d1c2d] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#38bdf8] transition-colors font-mono-numbers"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setSortBy((prev) => (prev === 'value' ? 'profit' : prev === 'profit' ? 'target' : 'value'));
          }}
          className="w-9 h-9 rounded-xl bg-[#0d1c2d] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#38bdf8] hover:border-[#38bdf8]/40 transition-colors shrink-0 cursor-pointer"
          title={`Ordenação: ${sortBy}`}
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Filter Matrix */}
      <div className="space-y-2 text-[11px] font-display select-none">
        {/* Row 1: PAÍS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] shrink-0 w-14">
            País
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCountry('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedCountry === 'ALL'
                  ? 'bg-[#38bdf8] text-[#051424] font-bold'
                  : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedCountry('BR')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                selectedCountry === 'BR'
                  ? 'bg-[#38bdf8] text-[#051424] font-bold'
                  : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
              }`}
            >
              <span>🇧🇷</span>
              <span>Brasil</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCountry('US')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                selectedCountry === 'US'
                  ? 'bg-[#38bdf8] text-[#051424] font-bold'
                  : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span>EUA</span>
            </button>
          </div>
        </div>

        {/* Row 2: TIPO */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] shrink-0 w-14">
            Tipo
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {['TODOS', 'AÇÃO', 'FII', 'STOCK', 'ETF', 'REIT'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all uppercase cursor-pointer ${
                  selectedType === t
                    ? 'bg-[#1c2b3c] text-[#38bdf8] border border-[#38bdf8]/60 font-bold'
                    : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: CUSTÓDIA */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] shrink-0 w-14">
            Custódia
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {['Todas', 'XP', 'Avenue', 'NuInvest', 'IBKR', 'BTG'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBroker(b)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedBroker === b
                    ? 'bg-[#1c2b3c] text-white border border-[#38bdf8]/60 font-bold'
                    : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Asset Position Cards */}
      <div className="space-y-3">
        {filteredPositions.map((pos) => {
          const isNegative = pos.totalProfitLoss < 0;
          const isProfitPositive = pos.totalProfitLoss >= 0;

          // Compute displayed position total
          const positionTotalValue = pos.currentPrice * pos.totalQuantity;

          // Target bar percentage width (capped at 100)
          const targetWidth = Math.min(100, Math.max(5, (pos.currentPercent / 25) * 100));

          return (
            <div
              key={pos.id}
              className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3.5 shadow-md hover:border-[#38bdf8]/40 transition-all relative group"
            >
              {/* Header: Icon, Ticker, Badges, Flag, and Value + Day % */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#162032] border border-[#1e293b] flex items-center justify-center text-[#38bdf8] shrink-0 mt-0.5">
                    {pos.market === 'BR' ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <Globe2 className="w-4 h-4 text-[#ffb95f]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-white font-mono-numbers">
                        {pos.ticker}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#1e293b] text-[#94a3b8] font-mono-numbers">
                        {pos.assetClass}
                      </span>
                      <span className="text-xs">{pos.market === 'BR' ? '🇧🇷' : '🇺🇸'}</span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditAsset(pos)}
                        className="p-1 rounded bg-[#162032] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#38bdf8] transition-colors cursor-pointer ml-1"
                        title="Editar ativo"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-[#94a3b8] truncate mt-0.5">
                      {pos.name} • {pos.brokerBreakdown.length > 1 ? 'Multi-Custódia' : pos.brokerBreakdown[0]?.brokerFullName}
                    </div>
                  </div>
                </div>

                {/* Right: Value + Percentage Change */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-white font-mono-numbers">
                    {formatCurrency(positionTotalValue, pos.currentPriceCurrency, hideValues)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold font-mono-numbers px-1.5 py-0.5 rounded mt-0.5 ${
                      pos.totalProfitLossPercent >= 0
                        ? 'bg-[#10b981]/15 text-[#56e5a9]'
                        : 'bg-[#ef4444]/15 text-[#ffb4ab]'
                    }`}
                  >
                    <span>{pos.totalProfitLossPercent >= 0 ? '↑' : '↓'}</span>
                    <span>{formatPercent(pos.totalProfitLossPercent, false)}</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Cotação Atual & Preço Médio */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#1e293b] text-xs font-mono-numbers">
                <div>
                  <div className="text-[10px] text-[#94a3b8] uppercase font-display font-semibold flex items-center gap-1">
                    <span>Cotação Atual</span>
                    <span className="text-[9px] text-[#10b981]">● GFinance</span>
                  </div>
                  <div className="text-white font-bold mt-0.5">
                    {formatCurrency(pos.currentPrice, pos.currentPriceCurrency, hideValues)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#94a3b8] uppercase font-display font-semibold">
                    Preço Médio ({pos.totalQuantity} {pos.quantityUnitLabel || 'COTAS'})
                  </div>
                  <div
                    className={`font-bold mt-0.5 ${
                      pos.currentPrice < pos.avgPrice ? 'text-[#ffb4ab]' : 'text-[#8ed5ff]'
                    }`}
                  >
                    {formatCurrency(pos.avgPrice, pos.currentPriceCurrency, hideValues)}
                  </div>
                </div>
              </div>

              {/* Multi-Custody Breakdown */}
              {pos.brokerBreakdown.length > 1 && (
                <div className="mt-2.5 p-2 bg-[#051424] rounded-lg border border-[#1e293b] space-y-1 text-[11px] font-mono-numbers">
                  <div className="text-[9px] uppercase tracking-wider text-[#94a3b8] font-bold font-display">
                    Distribuição por Custódia:
                  </div>
                  {pos.brokerBreakdown.map((b, idx) => (
                    <div key={b.broker} className="flex items-center justify-between text-[#94a3b8]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx === 0 ? 'bg-[#f59e0b]' : 'bg-[#38bdf8]'
                          }`}
                        />
                        <span className="text-white font-medium">{b.brokerFullName}</span>
                      </div>
                      <span className="text-white font-medium">
                        {b.quantity} cotas ({formatCurrency(b.valueBrl, 'BRL', hideValues, false)})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Lucro / Prejuízo Acumulado */}
              <div className="mt-2.5 flex items-center justify-between text-xs font-mono-numbers">
                <span className="text-[#94a3b8]">
                  {isNegative ? 'Prejuízo acumulado:' : 'Lucro acumulado:'}
                </span>
                <span className={`font-bold ${isProfitPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {pos.currentPriceCurrency === 'USD' ? (
                    <>
                      {formatCurrency(pos.totalProfitLoss, 'USD', hideValues)}{' '}
                      <span className="text-[10px] text-[#94a3b8]">
                        ({formatCurrency(pos.totalProfitLoss * fxRate, 'BRL', hideValues, false)})
                      </span>
                    </>
                  ) : (
                    formatCurrency(pos.totalProfitLoss, 'BRL', hideValues)
                  )}
                </span>
              </div>

              {/* Target / Allocation Progress Bar */}
              <div className="mt-2.5 pt-2 border-t border-[#1e293b]/70">
                <div className="flex items-center justify-between text-[11px] mb-1 font-mono-numbers">
                  <span className="text-[#94a3b8]">
                    Meta: {pos.targetPercent}% da carteira
                  </span>
                  <span
                    className={`font-bold ${
                      pos.statusLabel?.includes('Sobreponderado')
                        ? 'text-[#f59e0b]'
                        : pos.statusLabel?.includes('Oportunidade')
                        ? 'text-[#10b981]'
                        : 'text-[#38bdf8]'
                    }`}
                  >
                    {pos.currentPercent}%{' '}
                    {pos.statusLabel ? `(${pos.statusLabel.replace('Meta: 20% da carteira', '') || 'Alinhado'})` : ''}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#051424] overflow-hidden">
                  <div
                    style={{ width: `${targetWidth}%` }}
                    className={`h-full rounded-full ${
                      pos.statusLabel?.includes('Sobreponderado')
                        ? 'bg-[#f59e0b]'
                        : pos.statusLabel?.includes('Oportunidade')
                        ? 'bg-[#10b981]'
                        : 'bg-[#38bdf8]'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Floating Bottom Synchronization & Quick Order Bar */}
      <div className="fixed bottom-[68px] left-0 right-0 max-w-md mx-auto px-3 pointer-events-none z-30">
        <div className="pointer-events-auto bg-[#090d16]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-2.5 shadow-2xl flex items-center justify-between gap-2">
          {/* Sync status */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onRefreshSync}
              className={`w-7 h-7 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center text-[#38bdf8] shrink-0 transition-transform cursor-pointer ${
                isUpdatingQuotes ? 'animate-spin text-[#f59e0b]' : 'hover:rotate-180'
              }`}
              title="Sincronizar B3/CEI & Google Finance"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#94a3b8] uppercase font-display leading-tight truncate">
                Sincronização B3 & Google Finance
              </div>
              <div className="text-[11px] text-[#d4e4fa] font-mono-numbers leading-tight truncate">
                Cotações ao vivo • <span className="text-[#10b981]">Tempo Real</span>
              </div>
            </div>
          </div>

          {/* Quick Order Button */}
          <button
            type="button"
            onClick={() => onNavigateLancar()}
            className="py-2 px-3.5 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-lg font-display flex items-center gap-1 shrink-0 shadow-md shadow-[#38bdf8]/20 transition-all active:scale-[0.97] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Lançar Ordem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
