import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  RotateCcw,
  ArrowRight,
  Coins,
  Plus,
  Edit2,
} from 'lucide-react';
import { Broker, Currency, Dividend, MonthlyDividendFlow } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProventosScreenProps {
  dividends: Dividend[];
  monthlyFlow: MonthlyDividendFlow[];
  currency: Currency;
  hideValues: boolean;
  fxRate: number;
  onNavigateLancar: (ticker?: string) => void;
  onSuccessToast?: (msg: string) => void;
  onAddNewDividend?: () => void;
  onEditDividend?: (dividend: Dividend) => void;
}

export const ProventosScreen: React.FC<ProventosScreenProps> = ({
  dividends,
  monthlyFlow,
  currency,
  hideValues,
  fxRate,
  onNavigateLancar,
  onSuccessToast,
  onAddNewDividend,
  onEditDividend,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CRONOGRAMA' | 'POR ATIVO' | 'HISTÓRICO'>('CRONOGRAMA');
  const [selectedGeo, setSelectedGeo] = useState<'ALL' | 'BR' | 'US'>('ALL');
  const [selectedBroker, setSelectedBroker] = useState<string>('Todas');
  const [selectedMonth, setSelectedMonth] = useState<string>('NOV');
  const [isReinvestApplied, setIsReinvestApplied] = useState(false);

  // Filter dividends
  const filteredDividends = dividends.filter((d) => {
    if (selectedGeo === 'BR' && d.market !== 'BR') return false;
    if (selectedGeo === 'US' && d.market !== 'US') return false;
    if (selectedBroker !== 'Todas' && d.broker !== selectedBroker) return false;
    return true;
  });

  // Calculate dynamic totals
  const totalBrlDividends = dividends
    .filter((d) => d.market === 'BR')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  const totalUsdDividends = dividends
    .filter((d) => d.market === 'US')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  // Annualized estimates
  const annualTotalBrl = 38650.0;
  const annualTotalUsd = 2450.0;
  const monthlyAverageBrl = (annualTotalBrl / 12);
  const monthlyAverageUsd = (annualTotalUsd / 12);

  const handleApplyReinvest = () => {
    setIsReinvestApplied(true);
    if (onSuccessToast) {
      onSuccessToast(
        'Ordem de reinvestimento gerada: 1 cota de HGLG11 e 1 ação de AAPL adquiridas com proventos!'
      );
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* 1. Projeção Anual Card */}
      <div className="bg-gradient-to-b from-[#1c1d12] via-[#121922] to-[#0a121c] border border-[#f59e0b]/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-[10px] font-bold tracking-widest text-[#f59e0b] uppercase font-display">
              Projeção Anual • 12 Meses
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-[10px] font-bold text-[#ffb95f] uppercase tracking-wider font-display">
              Ativo
            </span>
          </div>
        </div>

        <div className="my-1.5">
          <div className="text-[11px] text-[#94a3b8] font-medium">
            Total Estimado para Receber
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono-numbers mt-0.5">
            {hideValues ? '••••••' : 'R$ 38.650,00'}{' '}
            <span className="text-lg font-medium text-[#ffb95f]">
              {hideValues ? '' : 'US$ 2.450,00'}
            </span>
          </div>
        </div>

        {/* 2 Sub Metrics */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-[#1e293b]">
          {/* Yield on Cost */}
          <div className="bg-[#051424]/80 border border-[#1e293b] rounded-xl p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] font-display flex items-center gap-1">
              <span>Yield on Cost</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1 font-mono-numbers">
              <span className="text-base font-bold text-white">8,65%</span>
              <span className="text-[10px] text-[#94a3b8] font-medium">a.a.</span>
            </div>
            <div className="text-[10px] text-[#10b981] font-mono-numbers mt-0.5 flex items-center gap-0.5 font-medium">
              <span>↗</span>
              <span>+0,42% vs ltm</span>
            </div>
          </div>

          {/* Média Mensal */}
          <div className="bg-[#051424]/80 border border-[#1e293b] rounded-xl p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] font-display">
              Média Mensal
            </div>
            <div className="mt-1 flex items-baseline gap-1 font-mono-numbers">
              <span className="text-base font-bold text-white">
                {hideValues ? '••••••' : formatCurrency(monthlyAverageBrl, 'BRL', false, false)}
              </span>
            </div>
            <div className="text-[10px] text-[#ffb95f] font-mono-numbers mt-0.5 font-medium">
              {hideValues ? '+••••' : `+ US$ ${monthlyAverageUsd.toFixed(2)}/mês`}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Efeito Bola de Neve Ativo Card */}
      <div className="bg-[#121c27] border border-[#f59e0b]/30 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-[#ffb95f]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#ffb95f] font-display tracking-tight">
              Efeito Bola de Neve Ativo
            </h3>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#ffb95f] bg-[#f59e0b]/15 px-2 py-0.5 rounded font-display border border-[#f59e0b]/30">
            Reinvestimento
          </span>
        </div>
        <p className="text-xs text-[#d4e4fa] leading-relaxed">
          Com os proventos deste mês você adquire automaticamente{' '}
          <strong className="text-white font-semibold">1 cota de HGLG11</strong> e{' '}
          <strong className="text-white font-semibold">1 ação de AAPL</strong> sem tirar dinheiro do bolso.
        </p>
      </div>

      {/* 3. Sub Tabs: CRONOGRAMA | POR ATIVO | HISTÓRICO */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#0d1c2d] rounded-xl border border-[#1e293b] text-center font-display">
        {(['CRONOGRAMA', 'POR ATIVO', 'HISTÓRICO'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubTab(tab)}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === tab
                ? 'bg-[#38bdf8] text-[#051424] shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Fluxo de Proventos (Bar Chart) */}
      <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Fluxo de Proventos</h3>
            <span className="text-[10px] text-[#94a3b8]">
              Últimos 6m realizados vs. 6m projetados
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-medium font-display">
            <div className="flex items-center gap-1 text-[#ffb95f]">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span>Realizado</span>
            </div>
            <div className="flex items-center gap-1 text-[#38bdf8]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              <span>Previsto</span>
            </div>
          </div>
        </div>

        {/* 12-Month Bar Visualization */}
        <div className="mt-4 pt-3 flex items-end justify-between gap-1 h-36 border-b border-[#1e293b] pb-2 relative">
          {monthlyFlow.map((flow) => {
            const isRealized = flow.realizedBrl !== undefined;
            const amount = flow.realizedBrl ?? flow.projectedBrl ?? 0;
            const heightPercent = Math.min(100, Math.max(15, (amount / 4200) * 100));
            const isCurrent = flow.isCurrent;
            const isSelected = selectedMonth === flow.month;

            return (
              <div
                key={flow.month}
                onClick={() => setSelectedMonth(flow.month)}
                className="flex-1 flex flex-col items-center cursor-pointer group h-full justify-end"
                title={`${flow.month}: ${formatCurrency(amount, 'BRL')}`}
              >
                {isCurrent && (
                  <div className="mb-1 text-[9px] font-bold font-mono-numbers text-[#ffb95f] bg-[#f59e0b]/20 px-1 rounded border border-[#f59e0b]/40 animate-bounce">
                    3.8k
                  </div>
                )}

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[18px] rounded-t-sm transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-t from-[#f59e0b] to-[#fbbf24] shadow-md shadow-[#f59e0b]/30 ring-1 ring-[#f59e0b]'
                      : isRealized
                      ? 'bg-[#f59e0b] hover:brightness-110'
                      : 'bg-[#273a4e] group-hover:bg-[#38bdf8]'
                  } ${isSelected ? 'ring-2 ring-white' : ''}`}
                />

                <span
                  className={`text-[9px] mt-1.5 font-bold font-mono-numbers transition-colors ${
                    isCurrent
                      ? 'text-[#ffb95f]'
                      : isSelected
                      ? 'text-white'
                      : 'text-[#94a3b8]'
                  }`}
                >
                  {flow.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Filters */}
      <div className="space-y-2 select-none">
        {/* Geo Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedGeo('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-bold font-display transition-all shrink-0 cursor-pointer ${
              selectedGeo === 'ALL'
                ? 'bg-[#38bdf8] text-[#051424]'
                : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
            }`}
          >
            TODOS (GLOBO)
          </button>
          <button
            type="button"
            onClick={() => setSelectedGeo('BR')}
            className={`px-3 py-1 rounded-md text-xs font-bold font-display transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              selectedGeo === 'BR'
                ? 'bg-[#38bdf8] text-[#051424]'
                : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
            }`}
          >
            <span>🇧🇷</span>
            <span>BRASIL (R$)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedGeo('US')}
            className={`px-3 py-1 rounded-md text-xs font-bold font-display transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              selectedGeo === 'US'
                ? 'bg-[#38bdf8] text-[#051424]'
                : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
            }`}
          >
            <span>🇺🇸</span>
            <span>EUA (US$)</span>
          </button>
        </div>

        {/* Broker Selector & New Dividend Button */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Custódia:
            </span>
            {['Todas', 'XP', 'Avenue', 'NuInvest', 'IBKR', 'BTG'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBroker(b)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
                  selectedBroker === b
                    ? 'bg-[#1c2b3c] text-white border border-[#38bdf8]/60 font-bold'
                    : 'bg-[#0d1c2d] text-[#94a3b8] border border-[#1e293b] hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {onAddNewDividend && (
            <button
              type="button"
              onClick={onAddNewDividend}
              className="py-1 px-2.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#051424] text-[11px] font-bold rounded-lg font-display flex items-center gap-1 shrink-0 cursor-pointer transition-all shadow-sm"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Novo Provento</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. Confirmados / Data-Com Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#ffb95f]" />
            <h3 className="text-sm font-bold text-white font-display">Confirmados / Data-Com</h3>
          </div>
          <span className="text-[10px] font-bold text-[#ffb95f] bg-[#f59e0b]/15 px-2 py-0.5 rounded font-display border border-[#f59e0b]/30">
            Próx. 30 dias
          </span>
        </div>

        {/* Dividend Rows matching Image 3 */}
        <div className="space-y-2.5">
          {filteredDividends.map((div) => {
            let statusBadge = (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono-numbers bg-[#10b981]/15 text-[#56e5a9] border border-[#10b981]/30">
                ● CONFIRMADO
              </span>
            );

            if (div.status === 'PROVISIONADO') {
              statusBadge = (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono-numbers bg-slate-700/50 text-[#bdc8d1] border border-slate-600">
                  ● PROVISIONADO
                </span>
              );
            } else if (div.status === 'APROVADO AGE') {
              statusBadge = (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono-numbers bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30">
                  ● APROVADO AGE
                </span>
              );
            } else if (div.status === 'MENSAL') {
              statusBadge = (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono-numbers bg-[#38bdf8]/15 text-[#8ed5ff] border border-[#38bdf8]/30 flex items-center gap-0.5">
                  <RotateCcw className="w-2.5 h-2.5" /> MENSAL
                </span>
              );
            }

            return (
              <div
                key={div.id}
                className="bg-[#0d1c2d] border border-[#1e293b] rounded-xl p-3 shadow-md hover:border-[#38bdf8]/40 transition-colors relative group"
              >
                {/* Header line: Ticker, Type, Broker, Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{div.market === 'BR' ? '🇧🇷' : '🇺🇸'}</span>
                    <span className="text-xs font-bold text-white font-mono-numbers">
                      {div.ticker}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#1e293b] text-[#94a3b8] font-bold font-mono-numbers">
                      {div.assetClass}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#162032] text-[#38bdf8] font-bold font-mono-numbers">
                      {div.broker}
                    </span>

                    {/* Edit button */}
                    {onEditDividend && (
                      <button
                        type="button"
                        onClick={() => onEditDividend(div)}
                        className="p-1 rounded bg-[#162032] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#ffb95f] transition-colors cursor-pointer ml-1"
                        title="Editar provento"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {statusBadge}
                </div>

                {/* Sub details: per share & quantity */}
                <div className="text-xs text-[#94a3b8] font-mono-numbers flex items-center justify-between">
                  <span>{div.notes}</span>
                  {div.taxDeduction && (
                    <span className="text-[10px] text-[#94a3b8]">
                      BRUTO {formatCurrency(div.grossAmount || 0, 'USD')} ({div.taxDeduction})
                    </span>
                  )}
                </div>

                {/* Payment date & Total Amount */}
                <div className="mt-2 pt-2 border-t border-[#1e293b] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-mono-numbers">
                    <Calendar className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span>Pagamento:</span>
                    <span className="text-white font-bold">{div.paymentDate}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-[#94a3b8] uppercase font-display block">
                      {div.status === 'PROVISIONADO' || div.status === 'APROVADO AGE'
                        ? 'Total Previsto'
                        : div.status === 'MENSAL'
                        ? 'Total Bruto'
                        : 'Total Líquido'}
                    </span>
                    <span className="text-base font-bold text-[#ffb95f] font-mono-numbers">
                      {formatCurrency(div.totalAmount, div.currency, hideValues)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Reinvestir Proventos CTA Card */}
      <div className="bg-[#122131] border border-[#1e293b] rounded-xl p-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#ffb95f]">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-display">Reinvestir Proventos</h4>
            <span className="text-[11px] text-[#94a3b8] font-mono-numbers">
              Saldo projetado livre:{' '}
              <strong className="text-[#ffb95f]">
                {hideValues ? '••••••' : 'R$ 2.030,00'}
              </strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyReinvest}
          disabled={isReinvestApplied}
          className="py-2 px-3.5 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-lg font-display flex items-center gap-1 transition-all active:scale-[0.98] shadow-md shadow-[#38bdf8]/15 disabled:opacity-50 cursor-pointer"
        >
          <span>{isReinvestApplied ? 'Aplicado ✔' : 'Aplicar'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
