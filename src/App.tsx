import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { DashboardScreen } from './screens/DashboardScreen';
import { CarteiraScreen } from './screens/CarteiraScreen';
import { ProventosScreen } from './screens/ProventosScreen';
import { LancarScreen } from './screens/LancarScreen';
import { RaioXScreen } from './screens/RaioXScreen';
import { RemessaModal } from './components/RemessaModal';
import { NotificationsModal } from './components/NotificationsModal';
import {
  INITIAL_BROKER_BALANCES,
  INITIAL_DAILY_MOVERS,
  INITIAL_DIVIDENDS,
  INITIAL_FX_RATE,
  INITIAL_MONTHLY_FLOW,
  INITIAL_POSITIONS,
} from './data/initialData';
import { AssetClass, Broker, BrokerBalance, Currency, Dividend, Market, OperationType, Position } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [hideValues, setHideValues] = useState<boolean>(false);
  const [fxRate, setFxRate] = useState<number>(INITIAL_FX_RATE);

  // Core state with local storage fallback
  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('apex_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [brokerBalances, setBrokerBalances] = useState<BrokerBalance[]>(() => {
    const saved = localStorage.getItem('apex_brokers');
    return saved ? JSON.parse(saved) : INITIAL_BROKER_BALANCES;
  });

  const [dividends, setDividends] = useState<Dividend[]>(() => {
    const saved = localStorage.getItem('apex_dividends');
    return saved ? JSON.parse(saved) : INITIAL_DIVIDENDS;
  });

  const [monthlyFlow] = useState(INITIAL_MONTHLY_FLOW);
  const [dailyMovers] = useState(INITIAL_DAILY_MOVERS);

  // Modals & Navigation helpers
  const [isRemessaOpen, setIsRemessaOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [preselectedTicker, setPreselectedTicker] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('apex_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('apex_brokers', JSON.stringify(brokerBalances));
  }, [brokerBalances]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Handle new transaction execution
  const handleAddTransaction = (tx: {
    type: OperationType;
    ticker: string;
    name: string;
    market: Market;
    assetClass: AssetClass;
    broker: Broker;
    date: string;
    quantity: number;
    price: number;
    currency: Currency;
    fees: number;
    total: number;
  }) => {
    setPositions((prevPositions) => {
      const existingIndex = prevPositions.findIndex((p) => p.ticker === tx.ticker);

      if (existingIndex >= 0) {
        const existing = prevPositions[existingIndex];
        let newQty = existing.totalQuantity;
        let newAvg = existing.avgPrice;

        if (tx.type === 'COMPRA') {
          newQty = existing.totalQuantity + tx.quantity;
          const totalCost = existing.totalQuantity * existing.avgPrice + tx.quantity * tx.price + tx.fees;
          newAvg = newQty > 0 ? totalCost / newQty : tx.price;
        } else if (tx.type === 'VENDA') {
          newQty = Math.max(0, existing.totalQuantity - tx.quantity);
        }

        // Update broker breakdown
        const updatedBreakdown = [...existing.brokerBreakdown];
        const brokerIdx = updatedBreakdown.findIndex((b) => b.broker === tx.broker);
        const brokerVal = tx.currency === 'USD' ? tx.price * tx.quantity : tx.price * tx.quantity;

        if (brokerIdx >= 0) {
          const currentB = updatedBreakdown[brokerIdx];
          const bQty = tx.type === 'COMPRA' ? currentB.quantity + tx.quantity : Math.max(0, currentB.quantity - tx.quantity);
          updatedBreakdown[brokerIdx] = {
            ...currentB,
            quantity: bQty,
            valueBrl: bQty * (tx.currency === 'USD' ? tx.price * fxRate : tx.price),
            valueUsd: bQty * (tx.currency === 'BRL' ? tx.price / fxRate : tx.price),
          };
        } else {
          updatedBreakdown.push({
            broker: tx.broker,
            brokerFullName: tx.broker === 'XP' ? 'XP Investimentos' : tx.broker,
            quantity: tx.quantity,
            valueBrl: tx.quantity * (tx.currency === 'USD' ? tx.price * fxRate : tx.price),
            valueUsd: tx.quantity * (tx.currency === 'BRL' ? tx.price / fxRate : tx.price),
          });
        }

        const totalMarketVal = newQty * existing.currentPrice;
        const totalInvested = newQty * newAvg;
        const profitLoss = totalMarketVal - totalInvested;
        const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

        const updated = [...prevPositions];
        updated[existingIndex] = {
          ...existing,
          totalQuantity: newQty,
          avgPrice: newAvg,
          brokerBreakdown: updatedBreakdown,
          totalProfitLoss: profitLoss,
          totalProfitLossPercent: profitLossPct,
        };
        return updated;
      } else {
        // New asset
        const isUSD = tx.currency === 'USD';
        const newPos: Position = {
          id: tx.ticker.toLowerCase(),
          ticker: tx.ticker,
          name: tx.name,
          market: tx.market,
          assetClass: tx.assetClass,
          currentPrice: tx.price,
          currentPriceCurrency: tx.currency,
          avgPrice: tx.price,
          totalQuantity: tx.quantity,
          quantityUnitLabel: tx.assetClass === 'Ação' ? 'AÇÕES' : tx.assetClass === 'Stock' ? 'STOCKS' : 'COTAS',
          targetPercent: 10,
          currentPercent: 10,
          dayChangePercent: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0,
          statusLabel: 'Alinhado',
          brokerBreakdown: [
            {
              broker: tx.broker,
              brokerFullName: tx.broker === 'XP' ? 'XP Investimentos' : tx.broker,
              quantity: tx.quantity,
              valueBrl: tx.quantity * (isUSD ? tx.price * fxRate : tx.price),
              valueUsd: tx.quantity * (isUSD ? tx.price : tx.price / fxRate),
            },
          ],
        };
        return [newPos, ...prevPositions];
      }
    });

    // Update cash balance in broker
    setBrokerBalances((prevBalances: BrokerBalance[]) =>
      prevBalances.map((b: BrokerBalance) => {
        if (b.id === tx.broker) {
          const delta = tx.type === 'COMPRA' ? -tx.total : tx.total;
          return {
            ...b,
            freeCash: Math.max(0, b.freeCash + delta),
          };
        }
        return b;
      })
    );
  };

  // Get screen title for Header
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'inicio':
        return 'Dashboard';
      case 'carteira':
        return 'Carteira';
      case 'proventos':
        return 'Proventos';
      case 'lancar':
        return 'Lançar';
      case 'raiox':
        return 'Raio-X';
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col justify-between selection:bg-[#38bdf8] selection:text-[#051424]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-[#0d1c2d] border border-[#38bdf8] text-white p-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#38bdf8] shrink-0" />
          <span className="text-xs font-semibold font-display leading-tight">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Main Container - Centered responsive frame matching mobile-first layout */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#051424] shadow-2xl relative">
        {/* Top Header */}
        <Header
          title={getHeaderTitle()}
          currency={currency}
          onToggleCurrency={(c) => setCurrency(c)}
          hideValues={hideValues}
          onToggleHideValues={() => setHideValues((v) => !v)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={2}
        />

        {/* Screen Content */}
        <main className="flex-1 px-4 overflow-y-auto">
          {activeTab === 'inicio' && (
            <DashboardScreen
              currency={currency}
              onToggleCurrency={(c) => setCurrency(c)}
              hideValues={hideValues}
              onToggleHideValues={() => setHideValues((v) => !v)}
              brokerBalances={brokerBalances}
              dailyMovers={dailyMovers}
              fxRate={fxRate}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRemessaModal={() => setIsRemessaOpen(true)}
            />
          )}

          {activeTab === 'carteira' && (
            <CarteiraScreen
              positions={positions}
              currency={currency}
              hideValues={hideValues}
              fxRate={fxRate}
              onNavigateLancar={(ticker) => {
                setPreselectedTicker(ticker);
                setActiveTab('lancar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRefreshSync={() => {
                showToast('Custódias XP, Avenue, NuInvest e IBKR sincronizadas com sucesso!');
              }}
            />
          )}

          {activeTab === 'proventos' && (
            <ProventosScreen
              dividends={dividends}
              monthlyFlow={monthlyFlow}
              currency={currency}
              hideValues={hideValues}
              fxRate={fxRate}
              onNavigateLancar={(ticker) => {
                setPreselectedTicker(ticker);
                setActiveTab('lancar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSuccessToast={showToast}
            />
          )}

          {activeTab === 'lancar' && (
            <LancarScreen
              positions={positions}
              onAddTransaction={handleAddTransaction}
              preselectedTicker={preselectedTicker}
              fxRate={fxRate}
              onSuccessToast={showToast}
              onNavigateCarteira={() => {
                setActiveTab('carteira');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'raiox' && (
            <RaioXScreen
              positions={positions}
              currency={currency}
              hideValues={hideValues}
              fxRate={fxRate}
              onNavigateLancar={(ticker) => {
                setPreselectedTicker(ticker);
                setActiveTab('lancar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSuccessToast={showToast}
            />
          )}
        </main>

        {/* Bottom Persistent Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Interactive Remessa / FX Modal */}
      <RemessaModal
        isOpen={isRemessaOpen}
        onClose={() => setIsRemessaOpen(false)}
        fxRate={fxRate}
        onSuccessToast={showToast}
      />

      {/* Notifications / Sync Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onRefreshSync={() => {
          showToast('Sincronização forçada com B3 / CEI e corretores finalizada.');
        }}
      />
    </div>
  );
}
