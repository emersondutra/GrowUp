import React, { useState } from 'react';
import { X, Trash2, Edit3, ArrowUpRight, ArrowDownRight, Coins, Plus, Calendar, Filter } from 'lucide-react';
import { OperationType, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenNewOrder: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onOpenNewOrder,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | OperationType>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const handleStartEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditQty(t.quantity);
    setEditPrice(t.price);
  };

  const handleSaveEdit = (t: Transaction) => {
    onEditTransaction({
      ...t,
      quantity: editQty,
      price: editPrice,
      total: editQty * editPrice + t.fees,
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1c2d] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div>
            <h2 className="text-base font-bold text-white font-display">
              Histórico de Lançamentos
            </h2>
            <span className="text-xs text-[#94a3b8]">
              {transactions.length} operações registradas no livro de ordens
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewOrder();
              }}
              className="py-1 px-2.5 bg-[#38bdf8] text-[#051424] text-xs font-bold rounded-lg font-display flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#162032] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#051424] rounded-xl border border-[#1e293b] my-3 font-display text-xs">
          {(['ALL', 'COMPRA', 'VENDA', 'PROVENTO'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterType(mode)}
              className={`py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                filterType === mode
                  ? 'bg-[#1c2b3c] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              {mode === 'ALL' ? 'Todos' : mode}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#94a3b8] font-display">
              Nenhuma operação encontrada neste filtro.
            </div>
          ) : (
            filtered.map((t) => {
              const isEditMode = editingId === t.id;
              const isBuy = t.type === 'COMPRA';
              const isSell = t.type === 'VENDA';

              return (
                <div
                  key={t.id}
                  className="p-3 bg-[#051424] border border-[#1e293b] rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-display ${
                          isBuy
                            ? 'bg-[#10b981]/15 text-[#56e5a9] border border-[#10b981]/30'
                            : isSell
                            ? 'bg-[#ef4444]/15 text-[#ffb4ab] border border-[#ef4444]/30'
                            : 'bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30'
                        }`}
                      >
                        {t.type}
                      </span>
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        {t.ticker}
                      </span>
                      <span className="text-[10px] text-[#94a3b8] font-mono-numbers">
                        {t.broker}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8] font-mono-numbers">
                      <Calendar className="w-3 h-3" />
                      <span>{t.date}</span>
                    </div>
                  </div>

                  {isEditMode ? (
                    <div className="pt-2 border-t border-[#1e293b] space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] block">Qtd:</label>
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-[#162032] border border-[#1e293b] rounded px-2 py-1 text-white font-mono-numbers"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] block">Preço:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#162032] border border-[#1e293b] rounded px-2 py-1 text-white font-mono-numbers"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-[11px] text-[#94a3b8] hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(t)}
                          className="px-3 py-1 bg-[#38bdf8] text-[#051424] text-[11px] font-bold rounded-lg"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-[#1e293b]/50 text-xs font-mono-numbers">
                      <div className="text-[#94a3b8]">
                        {t.quantity} cotas @ {formatCurrency(t.price, t.currency)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {formatCurrency(t.total, t.currency)}
                        </span>

                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(t)}
                            className="p-1 text-[#94a3b8] hover:text-[#38bdf8] cursor-pointer"
                            title="Editar lançamento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1 text-[#94a3b8] hover:text-[#ef4444] cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
