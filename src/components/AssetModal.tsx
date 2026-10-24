import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Plus, Building2, Globe2 } from 'lucide-react';
import { AssetClass, Broker, Currency, Market, Position } from '../types';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (position: Position) => void;
  onDelete?: (id: string) => void;
  editingPosition?: Position | null;
  fxRate: number;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingPosition,
  fxRate,
}) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [market, setMarket] = useState<Market>('BR');
  const [assetClass, setAssetClass] = useState<AssetClass>('Ação');
  const [currentPrice, setCurrentPrice] = useState<number>(30);
  const [avgPrice, setAvgPrice] = useState<number>(28);
  const [totalQuantity, setTotalQuantity] = useState<number>(100);
  const [targetPercent, setTargetPercent] = useState<number>(15);
  const [selectedBroker, setSelectedBroker] = useState<Broker>('XP');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingPosition) {
      setTicker(editingPosition.ticker);
      setName(editingPosition.name);
      setMarket(editingPosition.market);
      setAssetClass(editingPosition.assetClass);
      setCurrentPrice(editingPosition.currentPrice);
      setAvgPrice(editingPosition.avgPrice);
      setTotalQuantity(editingPosition.totalQuantity);
      setTargetPercent(editingPosition.targetPercent);
      setSelectedBroker(editingPosition.brokerBreakdown[0]?.broker || 'XP');
    } else {
      setTicker('');
      setName('');
      setMarket('BR');
      setAssetClass('Ação');
      setCurrentPrice(30);
      setAvgPrice(28);
      setTotalQuantity(100);
      setTargetPercent(15);
      setSelectedBroker('XP');
    }
    setConfirmDelete(false);
  }, [editingPosition, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    const currency: Currency = market === 'BR' ? 'BRL' : 'USD';
    const isUSD = currency === 'USD';
    const totalVal = totalQuantity * currentPrice;
    const totalInvested = totalQuantity * avgPrice;
    const profitLoss = totalVal - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    const updatedPos: Position = {
      id: editingPosition?.id || ticker.toLowerCase(),
      ticker: ticker.toUpperCase(),
      name: name || ticker.toUpperCase(),
      market,
      assetClass,
      currentPrice,
      currentPriceCurrency: currency,
      avgPrice,
      totalQuantity,
      quantityUnitLabel: assetClass === 'Ação' ? 'AÇÕES' : assetClass === 'Stock' ? 'STOCKS' : 'COTAS',
      targetPercent,
      currentPercent: editingPosition?.currentPercent || targetPercent,
      dayChangePercent: editingPosition?.dayChangePercent || 0.45,
      totalProfitLoss: profitLoss,
      totalProfitLossPercent: profitLossPercent,
      statusLabel:
        targetPercent > 20
          ? 'Sobreponderado'
          : targetPercent < 8
          ? 'Oportunidade aporte'
          : 'Alinhado',
      brokerBreakdown: [
        {
          broker: selectedBroker,
          brokerFullName:
            selectedBroker === 'XP'
              ? 'XP Investimentos'
              : selectedBroker === 'Avenue'
              ? 'Avenue Securities'
              : selectedBroker === 'NuInvest'
              ? 'NuInvest'
              : selectedBroker === 'IBKR'
              ? 'Interactive Brokers'
              : selectedBroker,
          quantity: totalQuantity,
          valueBrl: totalQuantity * (isUSD ? currentPrice * fxRate : currentPrice),
          valueUsd: totalQuantity * (isUSD ? currentPrice : currentPrice / fxRate),
        },
      ],
    };

    onSave(updatedPos);
    onClose();
  };

  const isEditing = !!editingPosition;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1c2d] border border-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              {market === 'BR' ? <Building2 className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {isEditing ? `Editar Ativo: ${editingPosition.ticker}` : 'Cadastrar Novo Ativo'}
              </h2>
              <span className="text-xs text-[#94a3b8]">
                {isEditing ? 'Atualize os dados e metas da posição' : 'Adicione uma nova posição à carteira'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Market Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMarket('BR');
                if (assetClass === 'Stock' || assetClass === 'REIT') setAssetClass('Ação');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                market === 'BR'
                  ? 'bg-[#122131] border-[#38bdf8] text-[#38bdf8]'
                  : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
              }`}
            >
              <span>🇧🇷</span>
              <span>Brasil (B3)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMarket('US');
                if (assetClass === 'Ação' || assetClass === 'FII') setAssetClass('Stock');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                market === 'US'
                  ? 'bg-[#122131] border-[#38bdf8] text-[#38bdf8]'
                  : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
              }`}
            >
              <span>🇺🇸</span>
              <span>EUA (Wall St.)</span>
            </button>
          </div>

          {/* Ticker & Name */}
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
                placeholder="Ex: PETR4, AAPL"
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white uppercase font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Nome do Ativo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Petrobras PN"
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {/* Asset Class */}
          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
              Classe do Ativo
            </label>
            <div className="grid grid-cols-3 gap-1.5 font-display text-xs">
              {(['Ação', 'FII', 'Stock', 'ETF', 'REIT', 'BDR'] as AssetClass[]).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setAssetClass(cls)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    assetClass === cls
                      ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold'
                      : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Average Price */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Quantidade Total
              </label>
              <input
                type="number"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Preço Médio ({market === 'BR' ? 'R$' : 'US$'})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={avgPrice}
                onChange={(e) => setAvgPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {/* Current Price & Target % */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Cotação Atual ({market === 'BR' ? 'R$' : 'US$'})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                Meta na Carteira (%)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={targetPercent}
                onChange={(e) => setTargetPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-sm font-bold text-[#38bdf8] font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {/* Broker Custody */}
          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
              Corretora de Custódia
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-display text-xs">
              {(['XP', 'Avenue', 'NuInvest', 'IBKR'] as Broker[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBroker(b)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedBroker === b
                      ? 'bg-[#1c2b3c] border-[#38bdf8] text-[#38bdf8] font-bold'
                      : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#1e293b] space-y-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-xl font-display flex items-center justify-center gap-1.5 shadow-lg shadow-[#38bdf8]/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Salvar Alterações da Posição' : 'Adicionar Ativo à Carteira'}</span>
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
                    <span>Excluir Posição</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-[#201015] border border-[#ef4444]/40 rounded-xl space-y-2">
                    <p className="text-[11px] text-[#ffb4ab] text-center font-display font-semibold">
                      Tem certeza que deseja excluir a posição de {editingPosition.ticker}?
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
                          onDelete(editingPosition.id);
                          onClose();
                        }}
                        className="py-1.5 text-xs text-white bg-[#ef4444] font-bold rounded-lg font-display cursor-pointer"
                      >
                        Confirmar Exclusão
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
