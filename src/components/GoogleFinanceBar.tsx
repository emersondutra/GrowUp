import React from 'react';
import { RefreshCw, Activity, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface GoogleFinanceBarProps {
  fxRate: number;
  dollarChangePercent?: number;
  lastUpdated: Date;
  isUpdating: boolean;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
}

export const GoogleFinanceBar: React.FC<GoogleFinanceBarProps> = ({
  fxRate,
  dollarChangePercent = 0.9,
  lastUpdated,
  isUpdating,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}) => {
  // Format last updated time
  const timeString = lastUpdated.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-2.5 shadow-md select-none">
      <div className="flex items-center justify-between">
        {/* Left: Google Finance Brand & Dollar Quote */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
            <Zap className={`w-3.5 h-3.5 ${isUpdating ? 'animate-bounce text-[#f59e0b]' : 'text-[#38bdf8]'}`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-[10px] font-bold text-white font-display tracking-tight">
                Google Finance
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#10b981]/15 text-[#56e5a9] font-mono-numbers font-bold border border-[#10b981]/30">
                LIVE
              </span>
            </div>

            <div className="text-[11px] font-mono-numbers text-[#d4e4fa] flex items-center gap-1">
              <span>USD/BRL:</span>
              <strong className="text-white font-bold">R$ {fxRate.toFixed(4).replace('.', ',')}</strong>
              <span
                className={`text-[9px] font-bold ${
                  dollarChangePercent >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                }`}
              >
                {formatPercent(dollarChangePercent)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Refresh button & Auto status */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-[#94a3b8] block leading-none font-mono-numbers">
              {timeString}
            </span>
            <button
              type="button"
              onClick={onToggleAutoRefresh}
              className={`text-[9px] font-bold font-display ${
                autoRefreshEnabled ? 'text-[#38bdf8]' : 'text-[#94a3b8]'
              }`}
            >
              {autoRefreshEnabled ? 'Auto 30s ✓' : 'Auto pausado'}
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isUpdating}
            className="p-1.5 bg-[#122131] hover:bg-[#1c2b3c] border border-[#1e293b] hover:border-[#38bdf8]/50 text-[#d4e4fa] rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Atualizar cotações via Google Finance agora"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#38bdf8] ${isUpdating ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
