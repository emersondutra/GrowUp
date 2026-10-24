import React from 'react';
import { Bell, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  title: string;
  currency: Currency;
  onToggleCurrency: (curr: Currency) => void;
  hideValues: boolean;
  onToggleHideValues: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  currency,
  onToggleCurrency,
  hideValues,
  onToggleHideValues,
  onOpenNotifications,
  unreadNotificationsCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-header px-4 py-3 flex items-center justify-between border-b border-[#1e293b]">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#122b44] to-[#0c1a29] border border-[#38bdf8]/40 flex items-center justify-center shadow-sm shadow-[#38bdf8]/10">
          <TrendingUp className="w-5 h-5 text-[#38bdf8]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white font-display flex items-center gap-1.5 leading-none">
            ApexInvest
          </h1>
          <span className="text-xs text-[#94a3b8] font-medium leading-none block mt-1">
            {title}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Currency Switcher */}
        <div className="bg-[#0f172a] p-0.5 rounded-lg border border-[#1e293b] flex items-center">
          <button
            type="button"
            onClick={() => onToggleCurrency('BRL')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all font-mono-numbers ${
              currency === 'BRL'
                ? 'bg-[#38bdf8] text-[#051424] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#d4e4fa]'
            }`}
          >
            BRL
          </button>
          <button
            type="button"
            onClick={() => onToggleCurrency('USD')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all font-mono-numbers ${
              currency === 'USD'
                ? 'bg-[#38bdf8] text-[#051424] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#d4e4fa]'
            }`}
          >
            USD
          </button>
        </div>

        {/* Visibility Toggle */}
        <button
          type="button"
          onClick={onToggleHideValues}
          title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#d4e4fa] hover:border-[#38bdf8]/40 transition-colors"
        >
          {hideValues ? <EyeOff className="w-4 h-4 text-[#ffb95f]" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#d4e4fa] hover:border-[#38bdf8]/40 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f59e0b] border-2 border-[#051424]" />
          )}
        </button>

        {/* Executive Avatar */}
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 rounded-full border border-[#38bdf8]/40 overflow-hidden bg-[#162032] flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Investor Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to stylized monogram if external image is unavailable
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-[11px] font-bold text-[#38bdf8] font-display">ED</span>
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10b981] border border-[#051424]" />
        </div>
      </div>
    </header>
  );
};
