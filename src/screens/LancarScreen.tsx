import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Coins,
  Check,
  CheckCircle2,
  Calendar,
  Lock,
  Search,
  Mic,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { AssetClass, Broker, Currency, Market, OperationType, Position } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LancarScreenProps {
  positions: Position[];
  onAddTransaction: (transaction: {
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
  }) => void;
  preselectedTicker?: string;
  fxRate: number;
  onSuccessToast?: (msg: string) => void;
  onNavigateCarteira: () => void;
  onOpenHistory?: () => void;
  transactionsCount?: number;
  onBackToMais?: () => void;
}

export const LancarScreen: React.FC<LancarScreenProps> = ({
  positions,
  onAddTransaction,
  preselectedTicker,
  fxRate,
  onSuccessToast,
  onNavigateCarteira,
  onOpenHistory,
  transactionsCount = 1,
  onBackToMais,
}) => {
  // Operation mode
  const [opType, setOpType] = useState<OperationType>('COMPRA');
  const [market, setMarket] = useState<Market>('BR');

  // Form inputs (defaulting to the screenshot values)
  const [ticker, setTicker] = useState<string>(preselectedTicker || 'PETR4');
  const [selectedBroker, setSelectedBroker] = useState<Broker>('XP');
  const [executionDate, setExecutionDate] = useState<string>('2025-05-18');
  const [quantity, setQuantity] = useState<number>(200);
  const [price, setPrice] = useState<number>(36.40);
  const [fees, setFees] = useState<number>(3.50);

  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Suggestions database
  const catalog = [
    {
      badge: 'P4',
      ticker: 'PETR4',
      name: 'Petrobras PN',
      sub: 'Petróleo & Energia',
      tag: 'B3',
      assetClass: 'Ação' as AssetClass,
      market: 'BR' as Market,
      currency: 'BRL' as Currency,
      marketPrice: 38.42,
      changePercent: 1.24,
      existingAvg: 28.10,
      existingQty: 800,
    },
    {
      badge: 'AP',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      sub: 'Big Tech / Nasdaq',
      tag: 'US',
      assetClass: 'Stock' as AssetClass,
      market: 'US' as Market,
      currency: 'USD' as Currency,
      marketPrice: 228.40,
      changePercent: 0.68,
      existingAvg: 172.30,
      existingQty: 120,
    },
    {
      badge: 'HG',
      ticker: 'HGLG11',
      name: 'CSHG Logística',
      sub: 'FII Logístico',
      tag: 'B3',
      assetClass: 'FII' as AssetClass,
      market: 'BR' as Market,
      currency: 'BRL' as Currency,
      marketPrice: 164.15,
      changePercent: 0.45,
      existingAvg: 168.50,
      existingQty: 250,
    },
    {
      badge: 'NV',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      sub: 'Semiconductors / Nasdaq',
      tag: 'US',
      assetClass: 'Stock' as AssetClass,
      market: 'US' as Market,
      currency: 'USD' as Currency,
      marketPrice: 128.40,
      changePercent: 4.12,
      existingAvg: 86.60,
      existingQty: 120,
    },
    {
      badge: 'O',
      ticker: 'O',
      name: 'Realty Income Corp.',
      sub: 'Monthly Dividend REIT',
      tag: 'US',
      assetClass: 'REIT' as AssetClass,
      market: 'US' as Market,
      currency: 'USD' as Currency,
      marketPrice: 53.80,
      changePercent: -0.52,
      existingAvg: 51.20,
      existingQty: 180,
    },
  ];

  // Active asset match
  const selectedAsset = catalog.find((c) => c.ticker === ticker) || {
    badge: ticker.slice(0, 2).toUpperCase(),
    ticker: ticker,
    name: ticker,
    sub: 'Ativo Personalizado',
    tag: market === 'BR' ? 'B3' : 'US',
    assetClass: (market === 'BR' ? 'Ação' : 'Stock') as AssetClass,
    market: market,
    currency: (market === 'BR' ? 'BRL' : 'USD') as Currency,
    marketPrice: 36.40,
    changePercent: 0,
    existingAvg: 28.10,
    existingQty: 800,
  };

  // Find if user already holds this position in real portfolio
  const existingPos = positions.find((p) => p.ticker === ticker);
  const currentAvg = existingPos ? existingPos.avgPrice : selectedAsset.existingAvg;
  const currentQty = existingPos ? existingPos.totalQuantity : selectedAsset.existingQty;

  // Real-time Position Simulation calculation
  const totalOrder = (quantity || 0) * (price || 0) + (fees || 0);

  // New average price calculation for Buy
  let newAvgPrice = currentAvg;
  let newTotalQty = currentQty;
  let avgDeltaPercent = 0;

  if (opType === 'COMPRA') {
    newTotalQty = currentQty + (quantity || 0);
    const existingCost = currentAvg * currentQty;
    const newAdditionCost = (quantity || 0) * (price || 0) + (fees || 0);
    newAvgPrice = newTotalQty > 0 ? (existingCost + newAdditionCost) / newTotalQty : price;
    avgDeltaPercent = currentAvg > 0 ? ((newAvgPrice - currentAvg) / currentAvg) * 100 : 0;
  } else if (opType === 'VENDA') {
    newTotalQty = Math.max(0, currentQty - (quantity || 0));
    newAvgPrice = currentAvg; // Selling preserves average price in tax accounting
    avgDeltaPercent = 0;
  }

  // Handle select suggestion
  const handleSelectSuggestion = (item: typeof catalog[0]) => {
    setTicker(item.ticker);
    setMarket(item.market);
    setPrice(item.marketPrice);
    if (item.market === 'BR') {
      setSelectedBroker('XP');
    } else {
      setSelectedBroker('Avenue');
    }
  };

  const handleUseMarketPrice = () => {
    setPrice(selectedAsset.marketPrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || quantity <= 0 || price <= 0) return;

    onAddTransaction({
      type: opType,
      ticker: ticker.toUpperCase(),
      name: selectedAsset.name,
      market: selectedAsset.market,
      assetClass: selectedAsset.assetClass,
      broker: selectedBroker,
      date: executionDate,
      quantity: quantity,
      price: price,
      currency: selectedAsset.currency,
      fees: fees,
      total: totalOrder,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSuccessToast) {
        onSuccessToast(
          `Ordem de ${opType} de ${quantity} ${ticker} registrada na ${selectedBroker} com sucesso!`
        );
      }
      onNavigateCarteira();
    }, 1000);
  };

  const brokersList: { id: Broker; short: string; name: string }[] = [
    { id: 'XP', short: 'XP', name: 'XP Investimentos' },
    { id: 'BTG', short: 'BTG', name: 'BTG Pactual' },
    { id: 'Avenue', short: 'AV', name: 'Avenue' },
    { id: 'NuInvest', short: 'NU', name: 'NuInvest' },
    { id: 'IBKR', short: 'IB', name: 'IBKR LLC' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-28 pt-2">
      {/* Top Header Row with Back Button and History Trigger */}
      <div className="flex items-center justify-between pb-1 text-xs">
        {onBackToMais ? (
          <button
            type="button"
            onClick={onBackToMais}
            className="text-[11px] font-bold text-[#38bdf8] hover:text-[#7bd0ff] font-display flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>← Voltar para Mais</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display">
            Nova Operação
          </span>
        )}

        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="text-[11px] font-bold text-[#38bdf8] hover:text-[#7bd0ff] font-display flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span>Histórico ({transactionsCount})</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* 1. Operation Type Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#0d1c2d] rounded-xl border border-[#1e293b]">
        <button
          type="button"
          onClick={() => setOpType('COMPRA')}
          className={`py-2 text-xs font-bold rounded-lg font-display flex items-center justify-center gap-1.5 transition-all ${
            opType === 'COMPRA'
              ? 'bg-[#38bdf8] text-[#051424] shadow-md font-bold'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Compra</span>
        </button>

        <button
          type="button"
          onClick={() => setOpType('VENDA')}
          className={`py-2 text-xs font-bold rounded-lg font-display flex items-center justify-center gap-1.5 transition-all ${
            opType === 'VENDA'
              ? 'bg-[#ef4444] text-white shadow-md font-bold'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Venda</span>
        </button>

        <button
          type="button"
          onClick={() => setOpType('PROVENTO')}
          className={`py-2 text-xs font-bold rounded-lg font-display flex items-center justify-center gap-1.5 transition-all ${
            opType === 'PROVENTO'
              ? 'bg-[#f59e0b] text-[#051424] shadow-md font-bold'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Provento</span>
        </button>
      </div>

      {/* 2. Market Selector (Brasil vs EUA) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setMarket('BR')}
          className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
            market === 'BR'
              ? 'bg-[#122131] border-[#38bdf8] ring-1 ring-[#38bdf8]/40'
              : 'bg-[#0d1c2d] border-[#1e293b] opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🇧🇷</span>
            <div>
              <div className="text-xs font-bold text-white font-display">Brasil</div>
              <div className="text-[10px] text-[#94a3b8]">B3 S.A.</div>
            </div>
          </div>
          {market === 'BR' && (
            <div className="w-5 h-5 rounded-full bg-[#38bdf8] flex items-center justify-center text-[#051424]">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMarket('US')}
          className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
            market === 'US'
              ? 'bg-[#122131] border-[#38bdf8] ring-1 ring-[#38bdf8]/40'
              : 'bg-[#0d1c2d] border-[#1e293b] opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🇺🇸</span>
            <div>
              <div className="text-xs font-bold text-white font-display">EUA</div>
              <div className="text-[10px] text-[#94a3b8]">NYSE / NASDAQ</div>
            </div>
          </div>
          {market === 'US' && (
            <div className="w-5 h-5 rounded-full bg-[#38bdf8] flex items-center justify-center text-[#051424]">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </button>
      </div>

      {/* 3. Código do Ativo (Ticker) Input with quick suggestions */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-display font-semibold mb-1.5 uppercase tracking-wider">
          <span>Código do Ativo (Ticker)</span>
          <span className="text-[10px] font-mono-numbers text-[#38bdf8] flex items-center gap-1">
            <Search className="w-3 h-3" /> Buscar código
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ex: PETR4, AAPL..."
            className="w-full bg-[#0d1c2d] border border-[#1e293b] rounded-xl px-4 py-3 text-lg font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition-all uppercase"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#162032] text-[#8ed5ff] border border-[#1e293b] font-display">
              {market === 'BR' ? 'AÇÃO B3' : 'STOCK US'}
            </span>
            <Mic className="w-4 h-4 text-[#94a3b8]" />
          </div>
        </div>

        {/* Suggestion Dropdown Chips */}
        <div className="mt-2 space-y-2">
          {catalog
            .filter((c) => (market === 'BR' ? c.market === 'BR' : c.market === 'US'))
            .slice(0, 2)
            .map((item) => (
              <div
                key={item.ticker}
                onClick={() => handleSelectSuggestion(item)}
                className={`p-2.5 bg-[#051424] hover:bg-[#122131] border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  ticker === item.ticker ? 'border-[#38bdf8]' : 'border-[#1e293b]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center text-xs font-bold text-[#38bdf8] font-display">
                    {item.badge}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        {item.ticker}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#10b981]/15 text-[#56e5a9] font-bold font-mono-numbers">
                        {item.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">
                      {item.name} - {item.sub}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono-numbers">
                    {item.currency === 'BRL' ? 'R$' : '$'} {item.marketPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#10b981] font-mono-numbers font-medium">
                    +{item.changePercent}%
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 4. Instituição de Custódia */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-display font-semibold mb-1.5 uppercase tracking-wider">
          <span>Instituição de Custódia</span>
          <span className="text-[10px] text-[#94a3b8]">Contas ativas: 6</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {brokersList.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBroker(b.id)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium font-display transition-all shrink-0 flex items-center gap-1.5 ${
                selectedBroker === b.id
                  ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold shadow-sm'
                  : 'bg-[#0d1c2d] border-[#1e293b] text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="text-[9px] px-1 py-0.5 rounded bg-[#051424] font-mono-numbers font-bold">
                {b.short}
              </span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Data do Pregão / Execução */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-display font-semibold mb-1.5 uppercase tracking-wider">
          <span>Data do Pregão / Execução</span>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-[#38bdf8]/15 text-[#38bdf8] px-2 py-0.5 rounded border border-[#38bdf8]/30 font-display">
            Hoje (Automático)
          </span>
        </div>

        <div className="relative">
          <input
            type="date"
            value={executionDate}
            onChange={(e) => setExecutionDate(e.target.value)}
            className="w-full bg-[#0d1c2d] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
          />
          <Calendar className="w-4 h-4 text-[#94a3b8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 6. Quantidade & Preço Executado */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] text-[#94a3b8] font-display font-semibold mb-1 block uppercase tracking-wider">
            Quantidade
          </label>
          <div className="relative">
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-[#0d1c2d] border border-[#1e293b] rounded-xl px-3 py-2.5 text-base font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              placeholder="0"
            />
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase font-mono-numbers absolute right-3 top-1/2 -translate-y-1/2">
              Cotas
            </span>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#94a3b8] font-display font-semibold mb-1 block uppercase tracking-wider">
            Preço Executado
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={price || ''}
              onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#0d1c2d] border border-[#1e293b] rounded-xl pl-8 pr-3 py-2.5 text-base font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              placeholder="0.00"
            />
            <span className="text-xs font-bold text-[#94a3b8] font-mono-numbers absolute left-3 top-1/2 -translate-y-1/2">
              {market === 'BR' ? 'R$' : '$'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Market Quote Pill */}
      <div className="p-2.5 bg-[#051424] rounded-xl border border-[#1e293b] flex items-center justify-between text-xs font-mono-numbers">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[#94a3b8]">Cotação a mercado:</span>
          <span className="text-white font-bold">
            {market === 'BR' ? 'R$' : '$'} {selectedAsset.marketPrice.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleUseMarketPrice}
          className="text-[11px] font-bold text-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 px-2 py-1 rounded transition-colors font-display"
        >
          Usar cotação
        </button>
      </div>

      {/* Taxas / B3 / Corretagem (Opcional) */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-display font-semibold mb-1 uppercase tracking-wider">
          <span>Taxas / B3 / Corretagem</span>
          <span className="text-[10px] text-[#94a3b8]">Opcional</span>
        </div>

        <div className="relative">
          <input
            type="number"
            step="0.01"
            value={fees || ''}
            onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0d1c2d] border border-[#1e293b] rounded-xl pl-8 pr-8 py-2 text-xs font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
            placeholder="0.00"
          />
          <span className="text-xs font-bold text-[#94a3b8] font-mono-numbers absolute left-3 top-1/2 -translate-y-1/2">
            {market === 'BR' ? 'R$' : '$'}
          </span>
          <HelpCircle className="w-3.5 h-3.5 text-[#94a3b8] absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 7. Simulação da Posição (Impacto Real) */}
      <div className="bg-[#122131] border border-[#1e293b] rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
            <h4 className="text-xs font-bold text-white font-display">Simulação da Posição</h4>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded font-display border border-[#38bdf8]/30">
            Impacto Real
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 font-mono-numbers">
          <div>
            <div className="text-[10px] text-[#94a3b8] uppercase font-display">P. Médio Atual</div>
            <div className="text-xs text-white line-through opacity-70">
              {formatCurrency(currentAvg, selectedAsset.currency)}
            </div>
          </div>

          <div className="text-base text-[#94a3b8]">→</div>

          <div className="text-right">
            <div className="text-[10px] text-[#38bdf8] uppercase font-display font-bold">
              Novo Preço Médio
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base font-bold text-white">
                {formatCurrency(newAvgPrice, selectedAsset.currency)}
              </span>
              <span
                className={`text-[10px] font-bold px-1 rounded ${
                  avgDeltaPercent >= 0
                    ? 'bg-[#10b981]/15 text-[#56e5a9]'
                    : 'bg-[#ef4444]/15 text-[#ffb4ab]'
                }`}
              >
                {avgDeltaPercent >= 0 ? '+' : ''}
                {avgDeltaPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#94a3b8] block">Volume Líquido</span>
            <span className="text-xs font-bold text-white font-mono-numbers">
              {quantity} cotas {ticker}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#94a3b8] block uppercase font-display font-semibold">
              Total da Ordem
            </span>
            <span className="text-lg font-bold text-[#ffb95f] font-mono-numbers">
              {formatCurrency(totalOrder, selectedAsset.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 8. Primary CTA Button */}
      <button
        type="submit"
        disabled={isSuccess || quantity <= 0 || price <= 0}
        className="w-full py-3.5 px-4 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-sm rounded-xl font-display flex items-center justify-center gap-2 shadow-lg shadow-[#38bdf8]/20 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isSuccess ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-[#051424]" />
            <span>Lançamento Confirmado!</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirmar e Salvar Lançamento</span>
          </>
        )}
      </button>

      {/* 9. Security Encryption Notice */}
      <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[#94a3b8]">
        <Lock className="w-3.5 h-3.5 text-[#94a3b8]" />
        <span>Criptografia ponta a ponta e sincronização B3/CEI</span>
      </div>
    </form>
  );
};
