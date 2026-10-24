import React from 'react';
import { X, CheckCircle2, DollarSign, RefreshCw, Bell } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshSync?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onRefreshSync,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'Sincronização B3 / CEI Concluída',
      time: 'Hoje às 17:42',
      desc: 'Saldos de custódia XP e NuInvest atualizados em tempo real.',
      icon: RefreshCw,
      color: 'text-[#38bdf8]',
      bg: 'bg-[#38bdf8]/15',
    },
    {
      id: 'n2',
      title: 'Provento Creditado na Conta',
      time: 'Ontem às 09:15',
      desc: 'HGLG11 creditou R$ 275,00 líquidos na sua custódia da XP Investimentos.',
      icon: DollarSign,
      color: 'text-[#f59e0b]',
      bg: 'bg-[#f59e0b]/15',
    },
    {
      id: 'n3',
      title: 'Dividend Snowball Atingido',
      time: '18 Out',
      desc: 'Sua carteira atingiu a marca de reinvestimento 100% orgânico sem aportes externos.',
      icon: CheckCircle2,
      color: 'text-[#10b981]',
      bg: 'bg-[#10b981]/15',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1c2d] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Notificações & Telemetria
              </h2>
              <span className="text-xs text-[#94a3b8]">Central de alertas B3 e Wall Street</span>
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

        <div className="mt-4 space-y-3">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3 bg-[#051424] rounded-xl border border-[#1e293b] flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white font-display">{item.title}</h4>
                    <span className="text-[10px] text-[#94a3b8] font-mono-numbers">{item.time}</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            if (onRefreshSync) onRefreshSync();
            onClose();
          }}
          className="mt-4 w-full py-2.5 px-4 bg-[#162032] hover:bg-[#1c2b3c] border border-[#1e293b] text-white text-xs font-semibold rounded-xl font-display flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#38bdf8]" />
          Forçar Sincronização B3/CEI & Plaid Agora
        </button>
      </div>
    </div>
  );
};
