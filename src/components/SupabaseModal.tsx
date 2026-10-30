import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  UploadCloud,
  DownloadCloud,
  Key,
  Globe,
  ExternalLink,
  Code2,
  RefreshCw,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushToSupabase,
  pullFromSupabase,
  SUPABASE_MIGRATION_SQL,
} from '../lib/supabase';
import { Position, Transaction, Dividend, BrokerBalance } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  positions: Position[];
  transactions: Transaction[];
  dividends: Dividend[];
  balances: BrokerBalance[];
  onDataLoadedFromSupabase: (data: {
    positions: Position[];
    transactions: Transaction[];
    dividends: Dividend[];
    balances: BrokerBalance[];
  }) => void;
  onSuccessToast: (msg: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  positions,
  transactions,
  dividends,
  balances,
  onDataLoadedFromSupabase,
  onSuccessToast,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [configSource, setConfigSource] = useState<'env' | 'storage' | 'none'>('none');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message: string;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setConfigSource(config.source);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    const config = getSupabaseConfig();
    setConfigSource(config.source);
    onSuccessToast('Configurações do Supabase salvas com sucesso!');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(url, anonKey);
      setTestResult(result);
      if (result.success) {
        saveSupabaseConfig(url, anonKey);
        setConfigSource('storage');
        onSuccessToast('Conexão com o Supabase validada!');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushToSupabase = async () => {
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: 'Configure a URL e a Anon Key antes de sincronizar.',
      });
      return;
    }

    saveSupabaseConfig(url, anonKey);
    setIsSyncing(true);
    try {
      const result = await pushToSupabase({
        positions,
        transactions,
        dividends,
        balances,
      });

      if (result.success) {
        onSuccessToast('Carteira sincronizada com as tabelas do Supabase!');
        setTestResult({
          success: true,
          message: result.message,
        });
      } else {
        setTestResult({
          success: false,
          message: result.message,
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: 'Configure a URL e a Anon Key antes de buscar dados.',
      });
      return;
    }

    saveSupabaseConfig(url, anonKey);
    setIsPulling(true);
    try {
      const result = await pullFromSupabase();
      if (result.success && result.positions) {
        onDataLoadedFromSupabase({
          positions: result.positions,
          transactions: result.transactions || [],
          dividends: result.dividends || [],
          balances: result.balances || [],
        });
        onSuccessToast('Dados carregados com sucesso do Supabase!');
        setTestResult({
          success: true,
          message: result.message,
        });
      } else {
        setTestResult({
          success: false,
          message: result.message,
        });
      }
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    onSuccessToast('Script de Migração SQL copiado para a área de transferência!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([SUPABASE_MIGRATION_SQL], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'supabase_migration.sql';
    document.body.appendChild(element);
    element.click();
    element.remove();
    onSuccessToast('Download do arquivo supabase_migration.sql iniciado!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0b1928] border border-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#0d2238] via-[#091b2c] to-[#0b1928]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Conexão Supabase & PostgreSQL
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-mono-numbers">
                  POSTGRES 16
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Integração nativa com nuvem Supabase, migrações e sincronização
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Architecture Status Banner */}
          <div className="p-3.5 bg-[#051424] border border-[#1e293b] rounded-xl flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping mt-1 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-display">
                  Banco Relacional PostgreSQL Conectado
                </span>
                <span className="text-[10px] text-[#38bdf8] font-mono-numbers font-semibold">
                  Host: us-east1 • Port: 5432
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed">
                A aplicação conta com banco de dados PostgreSQL ativo via Drizzle ORM.
                Você também pode apontar diretamente para seu projeto no <strong>Supabase</strong> para
                armazenamento em nuvem, consultas em tempo real e autenticação unificada.
              </p>
            </div>
          </div>

          {/* Form Credentials */}
          <div className="space-y-3 bg-[#0d1c2d] p-4 rounded-xl border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4e4fa] font-display flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#38bdf8]" />
                Credenciais do Projeto Supabase
              </span>
              {configSource !== 'none' && (
                <span className="text-[10px] text-[#10b981] font-mono-numbers bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30">
                  {configSource === 'env' ? 'Configurado via .env' : 'Configurado Localmente'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#94a3b8] mb-1 font-display">
                PROJECT URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full pl-9 pr-3 py-2 bg-[#051424] border border-[#1e293b] rounded-lg text-white font-mono-numbers text-xs focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#94a3b8] mb-1 font-display">
                API KEY (ANON / PUBLIC)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-9 pr-3 py-2 bg-[#051424] border border-[#1e293b] rounded-lg text-white font-mono-numbers text-xs focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 py-2 px-3 bg-[#162032] hover:bg-[#1e2e46] border border-[#38bdf8]/40 text-[#38bdf8] rounded-lg font-bold font-display text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="py-2 px-4 bg-[#051424] hover:bg-[#162032] border border-[#1e293b] text-white rounded-lg font-bold font-display text-xs transition-colors cursor-pointer"
              >
                Salvar
              </button>
            </div>

            {/* Test Connection Result Feedback */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                    : 'bg-red-500/10 border-red-500/40 text-red-400'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.latencyMs && (
                    <span className="text-[10px] opacity-80 font-mono-numbers">
                      Tempo de resposta: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sync & Migration Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] font-display">
              Sincronização & Migrações
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handlePushToSupabase}
                disabled={isSyncing}
                className="p-3 bg-[#0d1c2d] hover:bg-[#162032] border border-[#1e293b] hover:border-[#10b981]/40 rounded-xl text-left flex flex-col justify-between group transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#10b981] font-mono-numbers font-bold">
                    PUSH
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-display block">
                    Enviar para Supabase
                  </span>
                  <span className="text-[10px] text-[#94a3b8] block mt-0.5">
                    {positions.length} ativos, {transactions.length} ordens
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handlePullFromSupabase}
                disabled={isPulling}
                className="p-3 bg-[#0d1c2d] hover:bg-[#162032] border border-[#1e293b] hover:border-[#38bdf8]/40 rounded-xl text-left flex flex-col justify-between group transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition-transform">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#38bdf8] font-mono-numbers font-bold">
                    PULL
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-display block">
                    Puxar do Supabase
                  </span>
                  <span className="text-[10px] text-[#94a3b8] block mt-0.5">
                    Substituir pelo estado da nuvem
                  </span>
                </div>
              </button>
            </div>

            {/* SQL Script Actions */}
            <div className="bg-[#051424] border border-[#1e293b] rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#ffb95f]">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-display block">
                    Migrations SQL do Supabase
                  </span>
                  <span className="text-[10px] text-[#94a3b8] block">
                    Arquivo pronto: <code className="text-[#38bdf8]">supabase-migration.sql</code>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSqlViewer(!showSqlViewer)}
                  className="px-2.5 py-1.5 bg-[#162032] hover:bg-[#1e2e46] border border-[#1e293b] text-white rounded-lg text-xs font-bold font-display transition-colors cursor-pointer"
                >
                  {showSqlViewer ? 'Ocultar SQL' : 'Ver SQL'}
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/40 text-[#10b981] rounded-lg text-xs font-bold font-display flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  title="Baixar arquivo .sql"
                  className="p-1.5 bg-[#162032] hover:bg-[#1e2e46] border border-[#1e293b] text-[#94a3b8] hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SQL Code Preview */}
            {showSqlViewer && (
              <div className="mt-2 bg-[#020b14] border border-[#1e293b] rounded-xl p-3 max-h-56 overflow-y-auto font-mono text-[11px] text-[#94a3b8] leading-relaxed custom-scrollbar">
                <pre>{SUPABASE_MIGRATION_SQL}</pre>
              </div>
            )}
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-3 bg-[#0d1c2d] border border-[#1e293b] rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-white font-display uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Como conectar seu Supabase em 3 passos:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#94a3b8]">
              <li>
                Crie um novo projeto no <strong className="text-white">Supabase</strong> (gratuito em supabase.com).
              </li>
              <li>
                Abra o menu <strong className="text-white">SQL Editor</strong>, cole o script copiado acima e clique em <strong className="text-white">Run</strong>.
              </li>
              <li>
                Acesse <strong className="text-white">Project Settings &gt; API</strong>, copie a <em>Project URL</em> e <em>anon public key</em> e cole nos campos acima.
              </li>
            </ol>
          </div>

          {/* VPS & Self-Hosted PostgreSQL Card */}
          <div className="p-3.5 bg-gradient-to-r from-[#0c2438] to-[#081827] border border-[#38bdf8]/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
                Deploy em VPS com PostgreSQL Próprio
              </span>
              <span className="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] font-bold px-2 py-0.5 rounded border border-[#38bdf8]/40 font-mono-numbers">
                DOCKER & VPS READY
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              O projeto foi configurado com suporte nativo a <code className="text-white">DATABASE_URL</code> e variáveis padrão PostgreSQL.
              Arquivos de deploy gerados na raiz:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono-numbers text-[10px]">
              <div className="p-2 bg-[#051424] border border-[#1e293b] rounded-lg">
                <span className="text-white font-bold block">docker-compose.yml</span>
                <span className="text-[#94a3b8]">App + Postgres 16</span>
              </div>
              <div className="p-2 bg-[#051424] border border-[#1e293b] rounded-lg">
                <span className="text-white font-bold block">postgres-init.sql</span>
                <span className="text-[#94a3b8]">DDL + Seed Admin</span>
              </div>
              <div className="p-2 bg-[#051424] border border-[#1e293b] rounded-lg">
                <span className="text-white font-bold block">DEPLOY_VPS.md</span>
                <span className="text-[#94a3b8]">Guia Passo a Passo</span>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>Formato: <code className="text-[#38bdf8]">postgresql://user:pass@localhost:5432/growup</code></span>
              <span className="text-[#10b981]">Auto-inicialização de tabelas ativa</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#091624] flex items-center justify-between">
          <span className="text-[11px] text-[#94a3b8]">
            GrowUp Financial Engine • PostgreSQL 16
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#162032] hover:bg-[#1e2e46] border border-[#1e293b] text-white rounded-xl text-xs font-bold font-display transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
