import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, ShieldCheck, Building2 } from 'lucide-react';
import { Broker, BrokerBalance, Currency } from '../types';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (broker: BrokerBalance) => void;
  onDelete?: (id: Broker) => void;
  editingBroker?: BrokerBalance | null;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingBroker,
}) => {
  const [brokerId, setBrokerId] = useState<Broker>('BTG');
  const [name, setName] = useState('BTG Pactual');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [total, setTotal] = useState<number>(50000);
  const [freeCash, setFreeCash] = useState<number>(2500);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingBroker) {
      setBrokerId(editingBroker.id);
      setName(editingBroker.name);
      setCurrency(editingBroker.currency);
      setTotal(editingBroker.total);
      setFreeCash(editingBroker.freeCash);
    } else {
      setBrokerId('BTG');
      setName('BTG Pactual');
      setCurrency('BRL');
      setTotal(50000);
      setFreeCash(2500);
    }
    setConfirmDelete(false);
  }, [editingBroker, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: BrokerBalance = {
      id: brokerId,
      name,
      currency,
      total,
      freeCash,
      status: 'connected',
    };

    onSave(updated);
    onClose();
  };

  const isEditing = !!editingBroker;

  const brokerPresets: { id: Broker; name: string; currency: Currency }[] = [
    { id: 'XP', name: 'XP Investimentos', currency: 'BRL' },
    { id: 'Avenue', name: 'Avenue Securities', currency: 'USD' },
    { id: 'NuInvest', name: 'NuInvest', currency: 'BRL' },
    { id: 'IBKR', name: 'IBKR LLC', currency: 'USD' },
    { id: 'BTG', name: 'BTG Pactual', currency: 'BRL' },
    { id: 'Schwab', name: 'Charles Schwab', currency: 'USD' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1c2d] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {isEditing ? `Editar Custódia: ${editingBroker.name}` : 'Conectar Nova Corretora'}
              </h2>
              <span className="text-xs text-[#94a3b8]">
                {isEditing ? 'Atualize saldos e disponibilidade de caixa' : 'Vincule uma conta de custódia B3 ou Wall St.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {!isEditing && (
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Instituição Financeira
              </label>
              <div className="grid grid-cols-2 gap-2">
                {brokerPresets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBrokerId(b.id);
                      setName(b.name);
                      setCurrency(b.currency);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      brokerId === b.id
                        ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8]'
                        : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                    }`}
                  >
                    <div className="text-xs font-bold font-display">{b.name}</div>
                    <div className="text-[10px] text-[#94a3b8] font-mono-numbers">{b.currency}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nome e Moeda */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Moeda da Conta
              </label>
              <div className="grid grid-cols-2 gap-1 font-display text-xs">
                <button
                  type="button"
                  onClick={() => setCurrency('BRL')}
                  className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                    currency === 'BRL' ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold' : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  BRL (R$)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold' : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>

          {/* Saldo Total e Caixa Livre */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Patrimônio Total Custodiado
              </label>
              <input
                type="number"
                step="100"
                required
                value={total}
                onChange={(e) => setTotal(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Saldo Livre em Caixa (Cash)
              </label>
              <input
                type="number"
                step="50"
                required
                value={freeCash}
                onChange={(e) => setFreeCash(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-[#10b981] font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#1e293b] space-y-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-xl font-display flex items-center justify-center gap-1.5 shadow-lg shadow-[#38bdf8]/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Salvar Saldos de Custódia' : 'Conectar Corretora'}</span>
            </button>

            {isEditing && onDelete && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 px-3 bg-[#162032] hover:bg-[#202d42] border border-[#1e293b] hover:border-[#ef4444]/40 text-[#ef4444] text-xs font-bold rounded-xl font-display flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Desconectar Corretora</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-[#201015] border border-[#ef4444]/40 rounded-xl space-y-2">
                    <p className="text-[11px] text-[#ffb4ab] text-center font-display font-semibold">
                      Desconectar {editingBroker.name}?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="py-1.5 text-xs text-[#94a3b8] bg-[#051424] rounded-lg font-display cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(editingBroker.id);
                          onClose();
                        }}
                        className="py-1.5 text-xs text-white bg-[#ef4444] font-bold rounded-lg font-display cursor-pointer"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
