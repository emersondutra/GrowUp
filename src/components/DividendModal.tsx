import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Coins, Calendar } from 'lucide-react';
import { AssetClass, Broker, Currency, Dividend, DividendStatus, Market } from '../types';

interface DividendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dividend: Dividend) => void;
  onDelete?: (id: string) => void;
  editingDividend?: Dividend | null;
}

export const DividendModal: React.FC<DividendModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingDividend,
}) => {
  const [ticker, setTicker] = useState('HGLG11');
  const [market, setMarket] = useState<Market>('BR');
  const [assetClass, setAssetClass] = useState<AssetClass>('FII');
  const [broker, setBroker] = useState<Broker>('XP');
  const [perShare, setPerShare] = useState<number>(1.10);
  const [quantity, setQuantity] = useState<number>(250);
  const [paymentDate, setPaymentDate] = useState('14/Nov');
  const [status, setStatus] = useState<DividendStatus>('CONFIRMADO');
  const [notes, setNotes] = useState('R$ 1,10/cota • 250 cotas');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingDividend) {
      setTicker(editingDividend.ticker);
      setMarket(editingDividend.market);
      setAssetClass(editingDividend.assetClass);
      setBroker(editingDividend.broker);
      setPerShare(editingDividend.perShare);
      setQuantity(editingDividend.quantity);
      setPaymentDate(editingDividend.paymentDate);
      setStatus(editingDividend.status);
      setNotes(editingDividend.notes || '');
    } else {
      setTicker('HGLG11');
      setMarket('BR');
      setAssetClass('FII');
      setBroker('XP');
      setPerShare(1.10);
      setQuantity(250);
      setPaymentDate('14/Nov');
      setStatus('CONFIRMADO');
      setNotes('R$ 1,10/cota • 250 cotas');
    }
    setConfirmDelete(false);
  }, [editingDividend, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    const currency: Currency = market === 'BR' ? 'BRL' : 'USD';
    const totalAmount = Number((perShare * quantity).toFixed(2));

    const updatedDiv: Dividend = {
      id: editingDividend?.id || `div-${Date.now()}`,
      ticker: ticker.toUpperCase(),
      assetClass,
      broker,
      market,
      perShare,
      quantity,
      paymentDate,
      status,
      totalAmount,
      currency,
      notes: notes || `${currency === 'BRL' ? 'R$' : 'US$'} ${perShare.toFixed(2)} • ${quantity} cotas`,
    };

    onSave(updatedDiv);
    onClose();
  };

  const isEditing = !!editingDividend;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1c2d] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center text-[#ffb95f]">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {isEditing ? `Editar Provento: ${editingDividend.ticker}` : 'Cadastrar Novo Provento'}
              </h2>
              <span className="text-xs text-[#94a3b8]">
                {isEditing ? 'Atualize a data ou valor do dividendo' : 'Cadastre anúncio de dividendos ou JCP'}
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
          {/* Ticker & Market */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Ticker
              </label>
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Ex: HGLG11"
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers uppercase focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Mercado
              </label>
              <div className="grid grid-cols-2 gap-1 font-display text-xs">
                <button
                  type="button"
                  onClick={() => setMarket('BR')}
                  className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                    market === 'BR' ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold' : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  🇧🇷 B3
                </button>
                <button
                  type="button"
                  onClick={() => setMarket('US')}
                  className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                    market === 'US' ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold' : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  🇺🇸 EUA
                </button>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
              Status do Provento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-display text-[11px]">
              {(['CONFIRMADO', 'PROVISIONADO', 'APROVADO AGE', 'MENSAL'] as DividendStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    status === st
                      ? 'bg-[#1c2b3c] border-[#f59e0b] text-[#ffb95f] font-bold'
                      : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Value Per Share & Quantity */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Valor por Cota ({market === 'BR' ? 'R$' : 'US$'})
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={perShare}
                onChange={(e) => setPerShare(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Quantidade de Cotas
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {/* Payment Date & Broker */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Data do Pagamento
              </label>
              <input
                type="text"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                placeholder="Ex: 14/Nov"
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Custódia
              </label>
              <select
                value={broker}
                onChange={(e) => setBroker(e.target.value as Broker)}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="XP">XP Investimentos</option>
                <option value="Avenue">Avenue Securities</option>
                <option value="NuInvest">NuInvest</option>
                <option value="IBKR">IBKR LLC</option>
                <option value="BTG">BTG Pactual</option>
              </select>
            </div>
          </div>

          {/* Total Calculated Box */}
          <div className="p-3 bg-[#051424] rounded-xl border border-[#1e293b] flex items-center justify-between font-mono-numbers">
            <span className="text-xs text-[#94a3b8]">Total Previsto:</span>
            <span className="text-lg font-bold text-[#ffb95f]">
              {market === 'BR' ? 'R$' : 'US$'} {(perShare * quantity).toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#1e293b] space-y-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-xl font-display flex items-center justify-center gap-1.5 shadow-lg shadow-[#38bdf8]/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Salvar Provento' : 'Cadastrar Provento na Agenda'}</span>
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
                    <span>Excluir Provento</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-[#201015] border border-[#ef4444]/40 rounded-xl space-y-2">
                    <p className="text-[11px] text-[#ffb4ab] text-center font-display font-semibold">
                      Excluir provento de {editingDividend.ticker}?
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
                          onDelete(editingDividend.id);
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
