import React, { useState } from 'react';
import { Bell, Eye, EyeOff, LogOut, User, Shield, ChevronDown, Database, Users } from 'lucide-react';
import { Currency, UserRole } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  title: string;
  currency: Currency;
  onToggleCurrency: (curr: Currency) => void;
  hideValues: boolean;
  onToggleHideValues: () => void;
  onOpenNotifications?: () => void;
  onOpenSupabase?: () => void;
  onOpenUserCrud?: () => void;
  unreadNotificationsCount?: number;
  userEmail?: string;
  userName?: string;
  userFullName?: string;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  currency,
  onToggleCurrency,
  hideValues,
  onToggleHideValues,
  onOpenNotifications,
  onOpenSupabase,
  onOpenUserCrud,
  unreadNotificationsCount = 2,
  userEmail = 'emerson.dutra@gmail.com',
  userName = 'Emerson',
  userFullName = 'Emerson Rocha Dutra',
  userRole = 'admin',
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-header px-4 py-3 flex items-center justify-between border-b border-[#1e293b]">
      {/* GrowUp Brand Logo & Screen Subtitle */}
      <div className="flex items-center gap-2.5">
        <Logo size="md" showWordmark={true} subtitle={title} />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Currency Switcher */}
        <div className="bg-[#0f172a] p-0.5 rounded-lg border border-[#1e293b] flex items-center">
          <button
            type="button"
            onClick={() => onToggleCurrency('BRL')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all font-mono-numbers cursor-pointer ${
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
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all font-mono-numbers cursor-pointer ${
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
          className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#d4e4fa] hover:border-[#38bdf8]/40 transition-colors cursor-pointer"
        >
          {hideValues ? <EyeOff className="w-4 h-4 text-[#ffb95f]" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#d4e4fa] hover:border-[#38bdf8]/40 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f59e0b] border-2 border-[#051424]" />
          )}
        </button>

        {/* Executive Avatar & Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-8 h-8 rounded-full border border-[#38bdf8]/40 overflow-hidden bg-[#162032] flex items-center justify-center relative cursor-pointer group"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Investor Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-[11px] font-bold text-[#38bdf8] font-display">ED</span>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10b981] border border-[#051424]" />
          </button>

          {/* Profile Modal / Dropdown */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#0d1c2d] border border-[#1e293b] rounded-2xl shadow-2xl z-50 p-3.5 space-y-3 animate-fade-in">
                {/* User Info */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#1e293b]">
                  <div className="w-10 h-10 rounded-full border border-[#38bdf8]/50 overflow-hidden bg-[#162032] shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                      alt={userFullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white font-display truncate">
                      {userFullName || 'Emerson Rocha Dutra'}
                    </div>
                    <div className="text-[10px] text-[#94a3b8] truncate font-mono-numbers">
                      {userEmail}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {userRole === 'admin' ? (
                        <span className="inline-block text-[9px] font-bold font-display uppercase tracking-wider text-[#ffb95f] bg-[#f59e0b]/20 px-1.5 py-0.2 rounded border border-[#f59e0b]/40">
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] font-bold font-display uppercase tracking-wider text-[#10b981] bg-[#10b981]/20 px-1.5 py-0.2 rounded border border-[#10b981]/40">
                          CLIENTE
                        </span>
                      )}
                      <span className="inline-block text-[9px] font-bold font-display uppercase tracking-wider text-[#38bdf8] bg-[#38bdf8]/15 px-1.5 py-0.2 rounded">
                        GrowUp Black
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details & Admin Features */}
                <div className="space-y-1 text-xs">
                  {userRole === 'admin' && onOpenUserCrud && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenUserCrud();
                      }}
                      className="w-full flex items-center justify-between text-[#ffb95f] hover:text-white py-1.5 px-2 rounded-lg bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <Users className="w-3.5 h-3.5 text-[#ffb95f]" />
                        Gestão de Usuários
                      </span>
                      <span className="text-[10px] text-[#ffb95f] font-bold font-mono-numbers bg-[#f59e0b]/20 px-1.5 py-0.2 rounded border border-[#f59e0b]/40">
                        CRUD
                      </span>
                    </button>
                  )}

                  <div className="flex items-center justify-between text-[#94a3b8] py-1 px-2 rounded-lg hover:bg-[#162032] transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#10b981]" />
                      Custódias Conectadas
                    </span>
                    <span className="font-bold text-white font-mono-numbers">4 / 6</span>
                  </div>

                  {onOpenSupabase && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenSupabase();
                      }}
                      className="w-full flex items-center justify-between text-[#94a3b8] hover:text-white py-1.5 px-2 rounded-lg hover:bg-[#162032] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-xs">
                        <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
                        Supabase & DB
                      </span>
                      <span className="text-[10px] text-[#10b981] font-bold font-mono-numbers bg-[#10b981]/20 px-1.5 py-0.2 rounded border border-[#10b981]/40">
                        CONECTADO
                      </span>
                    </button>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full py-2 px-3 bg-[#162032] hover:bg-[#202d42] border border-[#1e293b] hover:border-[#ef4444]/40 text-[#ef4444] text-xs font-bold rounded-xl font-display flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair para Tela de Login</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
