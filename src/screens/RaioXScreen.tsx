import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Layers,
} from 'lucide-react';
import { Currency, Position } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface RaioXScreenProps {
  positions: Position[];
  currency: Currency;
  hideValues: boolean;
  fxRate: number;
  onNavigateLancar: (ticker?: string) => void;
  onSuccessToast?: (msg: string) => void;
}

export const RaioXScreen: React.FC<RaioXScreenProps> = ({
  positions,
  currency,
  hideValues,
  fxRate,
  onNavigateLancar,
  onSuccessToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'REBALANCE' | 'BOLA_DE_NEVE' | 'RISCO'>('REBALANCE');
  const [contributionAmount, setContributionAmount] = useState<number>(5000);
  const [yearsHorizon, setYearsHorizon] = useState<number>(5);
  const [expectedYield, setExpectedYield] = useState<number>(8.65);

  // Rebalancing calculation
  const totalEquityBrl = 184270;
  const newTotalEquityBrl = totalEquityBrl + contributionAmount;

  // Suggest orders to bring underweight assets toward target
  const rebalancingSuggestions = positions.map((pos) => {
    const isUSD = pos.currentPriceCurrency === 'USD';
    const currentPriceBrl = isUSD ? pos.currentPrice * fxRate : pos.currentPrice;
    const currentValBrl = pos.totalQuantity * currentPriceBrl;
    const targetValBrl = (pos.targetPercent / 100) * newTotalEquityBrl;
    const deltaBrl = targetValBrl - currentValBrl;

    let suggestedUnits = 0;
    if (deltaBrl > 0 && currentPriceBrl > 0) {
      suggestedUnits = Math.floor(deltaBrl / currentPriceBrl);
    }

    return {
      pos,
      deltaBrl,
      suggestedUnits,
      currentPriceBrl,
      isUnderweight: pos.currentPercent < pos.targetPercent,
    };
  });

  // Snowball Compounding Projection
  const currentAnnualDividendBrl = 38650 + 2450 * fxRate;
  const monthlyYieldDecimal = Math.pow(1 + expectedYield / 100, 1 / 12) - 1;

  // Calculate future monthly dividend after N years
  const totalMonths = yearsHorizon * 12;
  let simulatedBalance = totalEquityBrl;
  const monthlyDeposit = contributionAmount;

  for (let m = 0; m < totalMonths; m++) {
    const monthDiv = simulatedBalance * monthlyYieldDecimal;
    simulatedBalance += monthDiv + monthlyDeposit;
  }
  const projectedFutureMonthlyDividend = simulatedBalance * monthlyYieldDecimal;

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* 1. Sub Tabs Header */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#0d1c2d] rounded-xl border border-[#1e293b] font-display">
        <button
          type="button"
          onClick={() => setActiveSubTab('REBALANCE')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'REBALANCE'
              ? 'bg-[#38bdf8] text-[#051424] shadow-sm'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Rebalancear
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('BOLA_DE_NEVE')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'BOLA_DE_NEVE'
              ? 'bg-[#38bdf8] text-[#051424] shadow-sm'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Bola de Neve
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('RISCO')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'RISCO'
              ? 'bg-[#38bdf8] text-[#051424] shadow-sm'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Risco & Raio-X
        </button>
      </div>

      {/* VIEW 1: REBALANCING ENGINE */}
      {activeSubTab === 'REBALANCE' && (
        <div className="space-y-3.5">
          {/* Contribution Input Card */}
          <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-sm font-bold text-white font-display">
                  Aporte Inteligente Sem Vender Ativos
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30 font-display">
                Zero Imposto
              </span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
              O algoritmo direciona seu novo aporte exatamente para os ativos para trás da meta, reequilibrando a carteira organicamente.
            </p>

            <div className="p-3 bg-[#051424] rounded-xl border border-[#1e293b]">
              <div className="text-[11px] text-[#94a3b8] mb-1 font-display">
                Quanto você pretende aportar neste ciclo?
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white font-mono-numbers">R$</span>
                <input
                  type="number"
                  step="500"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="bg-transparent text-right text-2xl font-bold text-white font-mono-numbers focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Quick amount chips */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {[2000, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setContributionAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono-numbers font-semibold border transition-all ${
                    contributionAmount === amt
                      ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8]'
                      : 'bg-[#162032] border-[#1e293b] text-[#94a3b8] hover:text-white'
                  }`}
                >
                  +{formatCurrency(amt, 'BRL', false, false)}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider font-display">
              Ordens Recomendadas pelo Algoritmo
            </h4>

            {rebalancingSuggestions.map(({ pos, deltaBrl, suggestedUnits, isUnderweight }) => {
              const isUSD = pos.currentPriceCurrency === 'USD';
              return (
                <div
                  key={pos.id}
                  className="p-3 bg-[#0d1c2d] border border-[#1e293b] rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center font-bold text-xs text-white font-mono-numbers">
                      {pos.ticker.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-mono-numbers">
                          {pos.ticker}
                        </span>
                        <span className="text-[10px] text-[#94a3b8]">
                          {pos.currentPercent}% (Meta: {pos.targetPercent}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94a3b8]">
                        {isUnderweight ? (
                          <span className="text-[#10b981] font-semibold">
                            Subponderado • Aporte indicado
                          </span>
                        ) : (
                          <span className="text-[#f59e0b]">Alinhado / Sobreponderado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {suggestedUnits > 0 ? (
                      <button
                        type="button"
                        onClick={() => onNavigateLancar(pos.ticker)}
                        className="py-1 px-2.5 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-lg font-display flex items-center gap-1 transition-all"
                      >
                        <span>Comprar +{suggestedUnits}</span>
                        <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="text-xs text-[#94a3b8] font-mono-numbers font-medium">
                        Aguardar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: BOLA DE NEVE COMPILATION */}
      {activeSubTab === 'BOLA_DE_NEVE' && (
        <div className="space-y-3.5">
          <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffb95f]" />
                <h3 className="text-sm font-bold text-white font-display">
                  Simulador de Independência Financeira
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#ffb95f] bg-[#f59e0b]/15 px-2 py-0.5 rounded border border-[#f59e0b]/30 font-display">
                Juros Compostos
              </span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
              Veja a evolução dos seus proventos passivos mensais reinvestindo 100% dos dividendos recebidos no Brasil e no exterior.
            </p>

            {/* Slider 1: Prazo */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Horizonte de Tempo:</span>
                <span className="font-bold text-white font-mono-numbers">
                  {yearsHorizon} Anos ({yearsHorizon * 12} meses)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={yearsHorizon}
                onChange={(e) => setYearsHorizon(parseInt(e.target.value, 10))}
                className="w-full accent-[#38bdf8] cursor-pointer"
              />
            </div>

            {/* Projected Result Box */}
            <div className="p-4 bg-gradient-to-br from-[#1c1d12] via-[#121922] to-[#0a121c] rounded-xl border border-[#f59e0b]/40">
              <div className="text-xs text-[#94a3b8] uppercase font-display font-semibold mb-1">
                Renda Passiva Mensal Projetada
              </div>
              <div className="text-3xl font-bold text-[#ffb95f] font-mono-numbers">
                {hideValues ? '••••••' : formatCurrency(projectedFutureMonthlyDividend, 'BRL')}
              </div>
              <div className="text-xs text-[#94a3b8] mt-1 font-mono-numbers">
                Patrimônio estimado acumulado:{' '}
                <strong className="text-white">
                  {hideValues ? '••••••' : formatCurrency(simulatedBalance, 'BRL')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: RISCO & EXPOSIÇÃO */}
      {activeSubTab === 'RISCO' && (
        <div className="space-y-3.5">
          <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-bold text-white font-display mb-3">
              Raio-X de Exposição Cambial & Setorial
            </h3>

            {/* Currency exposure bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#94a3b8]">Exposição Cambial</span>
                <span className="font-mono-numbers font-bold text-white">58% BRL / 42% USD</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#051424]">
                <div style={{ width: '58%' }} className="h-full bg-[#10b981]" title="58% BRL" />
                <div style={{ width: '42%' }} className="h-full bg-[#38bdf8]" title="42% USD" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#94a3b8] mt-1">
                <span className="flex items-center gap-1">🟢 58% Real (B3)</span>
                <span className="flex items-center gap-1">🔵 42% Dólar (Offshore)</span>
              </div>
            </div>

            {/* Custody risk bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#94a3b8]">Diversificação de Custódia</span>
                <span className="font-mono-numbers font-bold text-white">4 Corretoras</span>
              </div>
              <div className="space-y-2 text-xs font-mono-numbers">
                <div className="flex items-center justify-between">
                  <span>XP Investimentos</span>
                  <span className="font-bold text-white">41% (R$ 312.450)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avenue Securities</span>
                  <span className="font-bold text-white">32% (US$ 38.920)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>NuInvest</span>
                  <span className="font-bold text-white">19% (R$ 176.287)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Interactive Brokers</span>
                  <span className="font-bold text-white">8% (US$ 25.427)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
