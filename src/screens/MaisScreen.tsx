import React from 'react';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  History,
  Briefcase,
  Coins,
  Building2,
  ArrowLeftRight,
  RefreshCw,
  Download,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
  Globe,
  ExternalLink,
  Wallet,
  FileSpreadsheet,
  Database,
  Users,
  UserCheck,
  Lock,
} from 'lucide-react';
import { TabKey } from '../components/BottomNav';
import { Currency, UserRole } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MaisScreenProps {
  onNavigateTab: (tab: TabKey) => void;
  onOpenHistory: () => void;
  onAddNewAsset: () => void;
  onAddNewDividend: () => void;
  onAddNewBroker: () => void;
  onOpenRemessaModal: () => void;
  onRefreshQuotes: () => void;
  onOpenSupabaseModal: () => void;
  onOpenUserCrud?: () => void;
  isUpdatingQuotes: boolean;
  lastUpdated: Date;
  fxRate: number;
  positionsCount: number;
  transactionsCount: number;
  brokersCount: number;
  dividendsCount: number;
  userEmail?: string;
  userName?: string;
  userFullName?: string;
  userCpf?: string;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const MaisScreen: React.FC<MaisScreenProps> = ({
  onNavigateTab,
  onOpenHistory,
  onAddNewAsset,
  onAddNewDividend,
  onAddNewBroker,
  onOpenRemessaModal,
  onRefreshQuotes,
  onOpenSupabaseModal,
  onOpenUserCrud,
  isUpdatingQuotes,
  lastUpdated,
  fxRate,
  positionsCount,
  transactionsCount,
  brokersCount,
  dividendsCount,
  userEmail = 'emerson.dutra@gmail.com',
  userName = 'Emerson',
  userFullName = 'Emerson Rocha Dutra',
  userCpf = '01576230171',
  userRole = 'admin',
  onLogout,
}) => {
  const handleExportData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        user: userEmail,
        positions: JSON.parse(localStorage.getItem('growup_positions') || '[]'),
        brokers: JSON.parse(localStorage.getItem('growup_brokers') || '[]'),
        dividends: JSON.parse(localStorage.getItem('growup_dividends') || '[]'),
        transactions: JSON.parse(localStorage.getItem('growup_transactions') || '[]'),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `growup_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Falha ao exportar dados:', e);
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* 1. Executive Terminal Identity Card */}
      <div className="p-4 bg-gradient-to-br from-[#0c2438] via-[#091b2c] to-[#04111d] rounded-2xl border border-[#38bdf8]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-[#38bdf8]/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-[#38bdf8]/40 overflow-hidden bg-[#162032] shrink-0 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Emerson Dutra"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-white font-display">
                  {userFullName || 'Emerson Rocha Dutra'}
                </h3>
                {userRole === 'admin' ? (
                  <span className="text-[10px] bg-[#f59e0b]/20 text-[#ffb95f] font-bold px-1.5 py-0.5 rounded border border-[#f59e0b]/40 flex items-center gap-1 font-mono-numbers">
                    <Shield className="w-2.5 h-2.5" />
                    ADMIN
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold px-1.5 py-0.5 rounded border border-[#10b981]/40 flex items-center gap-1 font-mono-numbers">
                    <UserCheck className="w-2.5 h-2.5" />
                    CLIENTE
                  </span>
                )}
                <span className="text-[10px] bg-[#10b981]/15 text-[#10b981] font-semibold px-1.5 py-0.2 rounded border border-[#10b981]/30">
                  QUALIFIED
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] font-mono-numbers mt-0.5 flex-wrap">
                <span className="truncate">{userEmail}</span>
                {userCpf && (
                  <>
                    <span>•</span>
                    <span>CPF: {userCpf}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#94a3b8] block uppercase tracking-wider font-display">
              Câmbio PTAX / GF
            </span>
            <span className="text-sm font-bold text-white font-mono-numbers">
              R$ {fxRate.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Quick portfolio telemetry tags */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#1e293b]/80 text-center font-mono-numbers">
          <div className="bg-[#051424]/60 p-1.5 rounded-lg border border-[#1e293b]">
            <span className="text-xs font-bold text-[#38bdf8] block">{positionsCount}</span>
            <span className="text-[9px] text-[#94a3b8] font-display">Ativos</span>
          </div>
          <div className="bg-[#051424]/60 p-1.5 rounded-lg border border-[#1e293b]">
            <span className="text-xs font-bold text-[#10b981] block">{brokersCount}</span>
            <span className="text-[9px] text-[#94a3b8] font-display">Corretoras</span>
          </div>
          <div className="bg-[#051424]/60 p-1.5 rounded-lg border border-[#1e293b]">
            <span className="text-xs font-bold text-[#ffb95f] block">{dividendsCount}</span>
            <span className="text-[9px] text-[#94a3b8] font-display">Proventos</span>
          </div>
          <div className="bg-[#051424]/60 p-1.5 rounded-lg border border-[#1e293b]">
            <span className="text-xs font-bold text-white block">{transactionsCount}</span>
            <span className="text-[9px] text-[#94a3b8] font-display">Ordens</span>
          </div>
        </div>
      </div>

      {/* 2. Operações & Inteligência de Carteira */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] font-display">
            Operações & Inteligência
          </h4>
          <span className="text-[10px] text-[#38bdf8] font-display font-semibold">
            B3 + Wall Street
          </span>
        </div>

        <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-2xl divide-y divide-[#1e293b] overflow-hidden shadow-lg">
          {/* Lançar Operação */}
          <button
            type="button"
            onClick={() => onNavigateTab('lancar')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#162032] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">
                    Lançar Nova Ordem
                  </span>
                  <span className="text-[9px] bg-[#38bdf8]/20 text-[#38bdf8] font-bold px-1.5 py-0.2 rounded font-mono-numbers">
                    COMPRA / VENDA
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Boleta de negociação com simulação de impacto no patrimônio e preço médio
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Raio-X & Rebalanceamento */}
          <button
            type="button"
            onClick={() => onNavigateTab('raiox')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#162032] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0 group-hover:scale-105 transition-transform">
                <Sliders className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">
                    Raio-X & Rebalanceamento
                  </span>
                  <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] font-bold px-1.5 py-0.2 rounded font-mono-numbers">
                    ALGORITMO
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Sugestão de aportes inteligentes para atingir metas sem giro de ativos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Simulador Bola de Neve */}
          <button
            type="button"
            onClick={() => onNavigateTab('raiox')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#162032] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/40 flex items-center justify-center text-[#ffb95f] shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">
                    Simulador Bola de Neve
                  </span>
                  <span className="text-[9px] bg-[#f59e0b]/20 text-[#ffb95f] font-bold px-1.5 py-0.2 rounded font-mono-numbers">
                    JUROS COMPOSTOS
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Projeção de renda passiva mensal reinvestindo proventos ao longo do tempo
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Histórico de Ordens Realizadas */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#162032] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#94a3b8]/15 border border-[#94a3b8]/40 flex items-center justify-center text-[#d4e4fa] shrink-0 group-hover:scale-105 transition-transform">
                <History className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">
                    Histórico de Ordens
                  </span>
                  <span className="text-[9px] bg-[#051424] text-[#94a3b8] font-bold px-1.5 py-0.2 rounded border border-[#1e293b] font-mono-numbers">
                    {transactionsCount} ordens
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Extrato auditado com filtro por tipo, edição de parâmetros e exclusão
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>
        </div>
      </div>

      {/* 3. Gestão Patrimonial & CRUDs Rápidos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] font-display">
            Gestão de Cadastros & Contas
          </h4>
          <span className="text-[10px] text-[#10b981] font-display font-semibold">
            CRUDs Ativos
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* CRUD Novo Ativo */}
          <button
            type="button"
            onClick={onAddNewAsset}
            className="p-3 bg-[#0d1c2d] hover:bg-[#162032] border border-[#1e293b] hover:border-[#38bdf8]/40 rounded-xl transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-2 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-display">
                + Novo Ativo
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">
                Cadastrar ação B3 ou stock US
              </div>
            </div>
          </button>

          {/* CRUD Novo Provento */}
          <button
            type="button"
            onClick={onAddNewDividend}
            className="p-3 bg-[#0d1c2d] hover:bg-[#162032] border border-[#1e293b] hover:border-[#f59e0b]/40 rounded-xl transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#ffb95f] mb-2 group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-display">
                + Novo Provento
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">
                Agendar dividendo ou JCP
              </div>
            </div>
          </button>

          {/* CRUD Instituições & Corretoras */}
          <button
            type="button"
            onClick={onAddNewBroker}
            className="p-3 bg-[#0d1c2d] hover:bg-[#162032] border border-[#1e293b] hover:border-[#10b981]/40 rounded-xl transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-2 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-display">
                + Nova Corretora
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">
                Conectar custódia ou saldo
              </div>
            </div>
          </button>

          {/* Simulador Remessa Câmbio */}
          <button
            type="button"
            onClick={onOpenRemessaModal}
            className="p-3 bg-[#0d1c2d] hover:bg-[#162032] border border-[#1e293b] hover:border-[#38bdf8]/40 rounded-xl transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-2 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-display">
                Remessa Cambial
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">
                Simular BRL ↔ USD com IOF
              </div>
            </div>
          </button>

          {/* CRUD Gestão de Usuários (Admin / Cliente) */}
          <div className="col-span-2">
            <button
              type="button"
              onClick={userRole === 'admin' ? onOpenUserCrud : undefined}
              disabled={userRole !== 'admin'}
              className={`w-full p-3.5 rounded-xl border transition-all text-left flex items-center justify-between group ${
                userRole === 'admin'
                  ? 'bg-gradient-to-r from-[#0c2438] via-[#0e2133] to-[#081827] border-[#f59e0b]/40 hover:border-[#f59e0b] cursor-pointer shadow-lg'
                  : 'bg-[#0d1c2d]/60 border-[#1e293b] cursor-not-allowed opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    userRole === 'admin'
                      ? 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#ffb95f] group-hover:scale-105 transition-transform'
                      : 'bg-[#1e293b] border-[#334155] text-[#64748b]'
                  }`}
                >
                  {userRole === 'admin' ? (
                    <Users className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-display">
                      Gestão de Usuários (CRUD)
                    </span>
                    {userRole === 'admin' ? (
                      <span className="text-[9px] bg-[#f59e0b]/20 text-[#ffb95f] font-bold px-2 py-0.5 rounded-full border border-[#f59e0b]/40 font-mono-numbers">
                        CRUD ADMIN
                      </span>
                    ) : (
                      <span className="text-[9px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-500/40 font-mono-numbers">
                        ACESSO RESTRITO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">
                    {userRole === 'admin'
                      ? 'Cadastrar, editar, excluir usuários e definir perfis (Admin ou Cliente) no PostgreSQL'
                      : 'Acesso restrito ao perfil Administrador. O perfil cliente tem acesso às visualizações de carteira.'}
                  </p>
                </div>
              </div>
              {userRole === 'admin' ? (
                <ChevronRight className="w-4 h-4 text-[#ffb95f] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              ) : (
                <Lock className="w-4 h-4 text-[#64748b] shrink-0 ml-2" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Telemetria Google Finance & Backup */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] font-display px-1">
          Dados, Conexões & Backup
        </h4>

        <div className="bg-[#0d1c2d] border border-[#1e293b] rounded-2xl divide-y divide-[#1e293b] overflow-hidden shadow-lg">
          {/* Google Finance Sync */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#051424] border border-[#1e293b] flex items-center justify-center text-[#38bdf8] shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-display">
                    Google Finance Telemetry
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5 font-mono-numbers">
                  Última sincronização: {lastUpdated.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefreshQuotes}
              disabled={isUpdatingQuotes}
              className="px-2.5 py-1.5 rounded-lg bg-[#162032] hover:bg-[#1e293b] border border-[#1e293b] text-xs font-bold text-[#38bdf8] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingQuotes ? 'animate-spin' : ''}`} />
              <span>{isUpdatingQuotes ? 'Atualizando...' : 'Sincronizar'}</span>
            </button>
          </div>

          {/* Conexão Supabase & PostgreSQL */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#162032] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">
                    Conexão Supabase & PostgreSQL
                  </span>
                  <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] font-bold px-1.5 py-0.2 rounded font-mono-numbers">
                    POSTGRES 16
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Credenciais da nuvem Supabase, sincronização e script de Migrations SQL
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#10b981] font-bold bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30 font-mono-numbers">
                ATIVO
              </span>
              <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </button>

          {/* Export JSON Backup */}
          <button
            type="button"
            onClick={handleExportData}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#162032] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#051424] border border-[#1e293b] flex items-center justify-center text-[#10b981] shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white font-display">
                  Exportar Backup Completo
                </span>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Download dos ativos, transações, proventos e custódias em formato JSON
                </p>
              </div>
            </div>
            <span className="text-[10px] text-[#94a3b8] font-mono-numbers bg-[#051424] px-2 py-1 rounded border border-[#1e293b]">
              JSON
            </span>
          </button>

          {/* Sair / Logout */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full p-3.5 flex items-center justify-between hover:bg-red-500/10 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-red-400 font-display">
                    Encerrar Sessão
                  </span>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">
                    Desconectar do Terminal GrowUp com segurança
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
