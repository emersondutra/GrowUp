import React, { useState } from 'react';
import { X, ArrowDownUp, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface RemessaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fxRate?: number;
  onSuccessToast?: (msg: string) => void;
}

export const RemessaModal: React.FC<RemessaModalProps> = ({
  isOpen,
  onClose,
  fxRate = 5.50,
  onSuccessToast,
}) => {
  const [direction, setDirection] = useState<'BRL_TO_USD' | 'USD_TO_BRL'>('BRL_TO_USD');
  const [amountInput, setAmountInput] = useState<string>('5000');
  const [selectedBroker, setSelectedBroker] = useState<'Avenue' | 'IBKR' | 'Wise'>('Avenue');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountInput) || 0;

  // Spreads
  const spreads = {
    Avenue: 0.012, // 1.2%
    IBKR: 0.010, // 1.0%
    Wise: 0.008, // 0.8%
  };

  const iofRate = 0.011; // 1.1% invest
  const currentSpread = spreads[selectedBroker];

  let convertedValue = 0;
  let iofValue = 0;
  let spreadValue = 0;
  let effectiveRate = fxRate;

  if (direction === 'BRL_TO_USD') {
    iofValue = numericAmount * iofRate;
    spreadValue = numericAmount * currentSpread;
    const netBrl = Math.max(0, numericAmount - iofValue - spreadValue);
    effectiveRate = fxRate * (1 + currentSpread + iofRate);
    convertedValue = netBrl / fxRate;
  } else {
    // USD to BRL
    spreadValue = numericAmount * fxRate * currentSpread;
    iofValue = numericAmount * fxRate * 0.0038;
    const grossBrl = numericAmount * fxRate;
    convertedValue = Math.max(0, grossBrl - spreadValue - iofValue);
    effectiveRate = fxRate * (1 - currentSpread - 0.0038);
  }

  const handleSimulateTransfer = () => {
    setIsCompleted(true);
    setTimeout(() => {
      setIsCompleted(false);
      onClose();
      if (onSuccessToast) {
        onSuccessToast(
          direction === 'BRL_TO_USD'
            ? `Remessa de ${formatCurrency(convertedValue, 'USD')} enviada com sucesso para ${selectedBroker}!`
            : `Resgate de ${formatCurrency(convertedValue, 'BRL')} processado para sua conta brasileira!`
        );
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1c2d] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <ArrowDownUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Câmbio & Remessa Global
              </h2>
              <span className="text-xs text-[#94a3b8]">
                B3 ⇄ Wall Street • Cotação Comercial
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direction Switch */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-[#051424] rounded-xl border border-[#1e293b]">
          <button
            type="button"
            onClick={() => setDirection('BRL_TO_USD')}
            className={`py-2 text-xs font-bold rounded-lg transition-all font-display flex items-center justify-center gap-1.5 ${
              direction === 'BRL_TO_USD'
                ? 'bg-[#38bdf8] text-[#051424] shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            🇧🇷 Enviar para EUA (USD)
          </button>
          <button
            type="button"
            onClick={() => setDirection('USD_TO_BRL')}
            className={`py-2 text-xs font-bold rounded-lg transition-all font-display flex items-center justify-center gap-1.5 ${
              direction === 'USD_TO_BRL'
                ? 'bg-[#38bdf8] text-[#051424] shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            🇺🇸 Repatriar para BR (R$)
          </button>
        </div>

        {/* Input Card */}
        <div className="mt-4 p-3.5 bg-[#051424] rounded-xl border border-[#1e293b]">
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span>Você envia</span>
            <span className="font-mono-numbers">
              Saldo livre: {direction === 'BRL_TO_USD' ? 'R$ 4.970,00' : 'US$ 1.570,00'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-white font-mono-numbers">
              {direction === 'BRL_TO_USD' ? 'R$' : 'US$'}
            </span>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-transparent text-right text-2xl font-bold text-white font-mono-numbers focus:outline-none"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="my-3 p-3 bg-[#122131] rounded-xl border border-[#1e293b] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span>Cotação Comercial (USD/BRL):</span>
            <span className="font-mono-numbers text-white font-semibold">
              R$ {fxRate.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span>IOF (Operação de Investimento 1,1%):</span>
            <span className="font-mono-numbers text-white">
              {formatCurrency(iofValue, 'BRL')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span>Spread da Corretora ({selectedBroker}):</span>
            <span className="font-mono-numbers text-white">
              {(currentSpread * 100).toFixed(1)}% ({formatCurrency(spreadValue, 'BRL')})
            </span>
          </div>
          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[#38bdf8] font-bold">
            <span>VET (Valor Efetivo Total):</span>
            <span className="font-mono-numbers">
              R$ {effectiveRate.toFixed(4).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Broker Selector */}
        <div className="mb-4">
          <label className="text-xs text-[#94a3b8] block mb-1.5 font-medium">
            Instituição de Destino / Origem:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Avenue', 'IBKR', 'Wise'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBroker(b)}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold font-display transition-all ${
                  selectedBroker === b
                    ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] shadow-sm'
                    : 'bg-[#051424] border-[#1e293b] text-[#94a3b8] hover:text-white'
                }`}
              >
                {b}
                <span className="block text-[10px] text-[#94a3b8] font-mono-numbers">
                  {(spreads[b] * 100).toFixed(1)}% spread
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Output Card */}
        <div className="p-3.5 bg-gradient-to-r from-[#122b44] to-[#0d1c2d] rounded-xl border border-[#38bdf8]/40 mb-4">
          <div className="flex items-center justify-between text-xs text-[#8ed5ff] mb-1">
            <span>Valor líquido estimado a receber</span>
            <span className="bg-[#10b981]/20 text-[#56e5a9] text-[10px] px-1.5 py-0.5 rounded font-mono-numbers font-semibold">
              Disponibilidade D+0
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono-numbers">
            {direction === 'BRL_TO_USD'
              ? formatCurrency(convertedValue, 'USD')
              : formatCurrency(convertedValue, 'BRL')}
          </div>
        </div>

        {/* Security / CTA */}
        <button
          type="button"
          onClick={handleSimulateTransfer}
          disabled={isCompleted || numericAmount <= 0}
          className="w-full py-3.5 px-4 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-sm rounded-xl font-display flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#38bdf8]/20"
        >
          {isCompleted ? (
            <>
              <Check className="w-5 h-5 text-[#051424]" />
              Remessa Processada com Sucesso!
            </>
          ) : (
            <>
              <ArrowDownUp className="w-4 h-4" />
              Executar Câmbio Instantâneo
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#94a3b8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Operação liquidada via Banco Central do Brasil & FINRA / SIPC</span>
        </div>
      </div>
    </div>
  );
};
