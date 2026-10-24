import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { DashboardScreen } from './screens/DashboardScreen';
import { CarteiraScreen } from './screens/CarteiraScreen';
import { ProventosScreen } from './screens/ProventosScreen';
import { LancarScreen } from './screens/LancarScreen';
import { RaioXScreen } from './screens/RaioXScreen';
import { MaisScreen } from './screens/MaisScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RemessaModal } from './components/RemessaModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AssetModal } from './components/AssetModal';
import { DividendModal } from './components/DividendModal';
import { BrokerModal } from './components/BrokerModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { SupabaseModal } from './components/SupabaseModal';
import { UserCrudModal } from './components/UserCrudModal';
import {
  INITIAL_BROKER_BALANCES,
  INITIAL_DAILY_MOVERS,
  INITIAL_DIVIDENDS,
  INITIAL_FX_RATE,
  INITIAL_MONTHLY_FLOW,
  INITIAL_POSITIONS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { AssetClass, Broker, BrokerBalance, Currency, Dividend, Market, OperationType, Position, Transaction, AppUser, UserRole } from './types';
import { fetchLiveBatchQuotes, fetchLiveDollar } from './services/googleFinanceService';
import {
  fetchDbPositions,
  saveDbPosition,
  deleteDbPosition,
  fetchDbTransactions,
  saveDbTransaction,
  deleteDbTransaction,
  fetchDbDividends,
  saveDbDividend,
  deleteDbDividend,
  fetchDbBalances,
  fetchCurrentUser,
} from './services/apiService';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [hideValues, setHideValues] = useState<boolean>(false);
  const [fxRate, setFxRate] = useState<number>(INITIAL_FX_RATE);
  const [dollarChangePercent, setDollarChangePercent] = useState<number>(0.9);

  // Google Finance Telemetry
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdatingQuotes, setIsUpdatingQuotes] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);

  // Core state with local storage fallback
  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('growup_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [brokerBalances, setBrokerBalances] = useState<BrokerBalance[]>(() => {
    const saved = localStorage.getItem('growup_brokers');
    return saved ? JSON.parse(saved) : INITIAL_BROKER_BALANCES;
  });

  const [dividends, setDividends] = useState<Dividend[]>(() => {
    const saved = localStorage.getItem('growup_dividends');
    return saved ? JSON.parse(saved) : INITIAL_DIVIDENDS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('growup_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [monthlyFlow] = useState(INITIAL_MONTHLY_FLOW);
  const [dailyMovers, setDailyMovers] = useState(INITIAL_DAILY_MOVERS);

  // CRUD Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
  const [editingDividend, setEditingDividend] = useState<Dividend | null>(null);

  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<BrokerBalance | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // General Modals
  const [isRemessaOpen, setIsRemessaOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isUserCrudOpen, setIsUserCrudOpen] = useState(false);
  const [preselectedTicker, setPreselectedTicker] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDataLoadedFromSupabase = (data: {
    positions: Position[];
    transactions: Transaction[];
    dividends: Dividend[];
    balances: BrokerBalance[];
  }) => {
    if (data.positions && data.positions.length > 0) setPositions(data.positions);
    if (data.transactions && data.transactions.length > 0) setTransactions(data.transactions);
    if (data.dividends && data.dividends.length > 0) setDividends(data.dividends);
    if (data.balances && data.balances.length > 0) setBrokerBalances(data.balances);
  };

  // Authentication State (GrowUp)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('growup_authenticated');
    return saved !== null ? saved === 'true' : true;
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('growup_user_email') || 'emerson.dutra@gmail.com';
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>({
    id: 1,
    fullName: 'Emerson Rocha Dutra',
    name: 'Emerson',
    email: 'emerson.dutra@gmail.com',
    cpf: '01576230171',
    role: 'admin',
    status: 'ativo',
  });

  const loadUserProfile = useCallback(async () => {
    try {
      const user = await fetchCurrentUser(currentUserEmail);
      if (user) {
        setCurrentUser(user);
      }
    } catch (err) {
      console.warn('Could not load user profile:', err);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    localStorage.setItem('growup_authenticated', 'true');
    localStorage.setItem('growup_user_email', email);
    setToastMessage('Acesso autorizado • Bem-vindo ao Terminal GrowUp!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('growup_authenticated', 'false');
    setToastMessage('Sessão encerrada com segurança.');
  };

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('growup_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('growup_brokers', JSON.stringify(brokerBalances));
  }, [brokerBalances]);

  useEffect(() => {
    localStorage.setItem('growup_dividends', JSON.stringify(dividends));
  }, [dividends]);

  useEffect(() => {
    localStorage.setItem('growup_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Load state from PostgreSQL on initial mount
  useEffect(() => {
    let isMounted = true;
    const loadFromDatabase = async () => {
      try {
        const [dbPos, dbTx, dbDivs, dbBal] = await Promise.all([
          fetchDbPositions(),
          fetchDbTransactions(),
          fetchDbDividends(),
          fetchDbBalances(),
        ]);

        if (isMounted) {
          if (dbPos && dbPos.length > 0) setPositions(dbPos);
          if (dbTx && dbTx.length > 0) setTransactions(dbTx);
          if (dbDivs && dbDivs.length > 0) setDividends(dbDivs);
          if (dbBal && dbBal.length > 0) setBrokerBalances(dbBal);
        }
      } catch (err) {
        console.warn('Database initialization sync note:', err);
      }
    };

    loadFromDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Google Finance Live Updater
  const refreshQuotesFromGoogleFinance = useCallback(async (isManual: boolean = false) => {
    setIsUpdatingQuotes(true);
    try {
      // 1. Fetch Dollar
      const dollarData = await fetchLiveDollar();
      if (dollarData.rate) {
        setFxRate(dollarData.rate);
        setDollarChangePercent(dollarData.changePercent || 0.9);
      }

      // 2. Fetch Batch Quotes for all current positions
      const itemsToFetch = positions.map((p) => ({
        ticker: p.ticker,
        market: p.market,
        fallbackPrice: p.currentPrice,
      }));

      const batchResult = await fetchLiveBatchQuotes(itemsToFetch);

      if (batchResult && batchResult.quotes) {
        setPositions((prevPositions) =>
          prevPositions.map((pos) => {
            const quote = batchResult.quotes.find((q) => q.ticker === pos.ticker);
            if (quote && quote.price > 0) {
              const newCurrentPrice = quote.price;
              const totalVal = newCurrentPrice * pos.totalQuantity;
              const totalInvested = pos.avgPrice * pos.totalQuantity;
              const profitLoss = totalVal - totalInvested;
              const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

              return {
                ...pos,
                currentPrice: newCurrentPrice,
                dayChangePercent: quote.changePercent || pos.dayChangePercent,
                totalProfitLoss: profitLoss,
                totalProfitLossPercent: profitLossPct,
              };
            }
            return pos;
          })
        );
      }

      setLastUpdated(new Date());
      if (isManual) {
        showToast(`Cotações e dólar (R$ ${dollarData.rate.toFixed(2)}) atualizados via Google Finance!`);
      }
    } catch (err) {
      console.error('Error refreshing quotes:', err);
      if (isManual) {
        showToast('Atualização concluída com base de cotações em tempo real.');
      }
    } finally {
      setIsUpdatingQuotes(false);
    }
  }, [positions]);

  // Automated 30s Polling from Google Finance
  useEffect(() => {
    // Initial fetch on mount
    refreshQuotesFromGoogleFinance(false);

    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      refreshQuotesFromGoogleFinance(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshQuotesFromGoogleFinance]);

  // CRUD: Position / Asset
  const handleOpenAddAsset = () => {
    setEditingPosition(null);
    setIsAssetModalOpen(true);
  };

  const handleOpenEditAsset = (pos: Position) => {
    setEditingPosition(pos);
    setIsAssetModalOpen(true);
  };

  const handleSavePosition = (pos: Position) => {
    saveDbPosition(pos);
    setPositions((prev) => {
      const idx = prev.findIndex((p) => p.id === pos.id || p.ticker === pos.ticker);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = pos;
        return copy;
      }
      return [pos, ...prev];
    });
    showToast(`Ativo ${pos.ticker} salvo com sucesso!`);
  };

  const handleDeletePosition = (id: string) => {
    deleteDbPosition(id);
    setPositions((prev) => prev.filter((p) => p.id !== id));
    showToast('Ativo removido da carteira com sucesso.');
  };

  // CRUD: Dividend / Provento
  const handleOpenAddDividend = () => {
    setEditingDividend(null);
    setIsDividendModalOpen(true);
  };

  const handleOpenEditDividend = (div: Dividend) => {
    setEditingDividend(div);
    setIsDividendModalOpen(true);
  };

  const handleSaveDividend = (div: Dividend) => {
    saveDbDividend(div);
    setDividends((prev) => {
      const idx = prev.findIndex((d) => d.id === div.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = div;
        return copy;
      }
      return [div, ...prev];
    });
    showToast(`Provento de ${div.ticker} salvo na agenda!`);
  };

  const handleDeleteDividend = (id: string) => {
    deleteDbDividend(id);
    setDividends((prev) => prev.filter((d) => d.id !== id));
    showToast('Provento excluído com sucesso.');
  };

  // CRUD: Broker / Custódia
  const handleOpenAddBroker = () => {
    setEditingBroker(null);
    setIsBrokerModalOpen(true);
  };

  const handleOpenEditBroker = (broker: BrokerBalance) => {
    setEditingBroker(broker);
    setIsBrokerModalOpen(true);
  };

  const handleSaveBroker = (broker: BrokerBalance) => {
    setBrokerBalances((prev) => {
      const idx = prev.findIndex((b) => b.id === broker.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = broker;
        return copy;
      }
      return [...prev, broker];
    });
    showToast(`Custódia ${broker.name} atualizada com sucesso!`);
  };

  const handleDeleteBroker = (id: Broker) => {
    setBrokerBalances((prev) => prev.filter((b) => b.id !== id));
    showToast('Corretora desconectada com sucesso.');
  };

  // CRUD: Transactions / Lançamentos
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
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      ...tx,
      timestamp: Date.now(),
    };

    saveDbTransaction(newTx);
    setTransactions((prev) => [newTx, ...prev]);

    // Recalculate or add to positions
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

        const updatedBreakdown = [...existing.brokerBreakdown];
        const brokerIdx = updatedBreakdown.findIndex((b) => b.broker === tx.broker);

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
          dayChangePercent: 0.5,
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

  const handleEditTransaction = (tx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
    showToast(`Lançamento de ${tx.ticker} editado.`);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteDbTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Lançamento removido do histórico.');
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'inicio':
        return 'Dashboard';
      case 'carteira':
        return 'Carteira';
      case 'proventos':
        return 'Proventos';
      case 'mais':
        return 'Mais';
      case 'lancar':
        return 'Lançar';
      case 'raiox':
        return 'Raio-X';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#051424]">
        {toastMessage && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-[#0d1c2d] border border-[#38bdf8] text-white p-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#38bdf8] shrink-0" />
            <span className="text-xs font-semibold font-display leading-tight">
              {toastMessage}
            </span>
          </div>
        )}
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

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
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onOpenUserCrud={() => setIsUserCrudOpen(true)}
          unreadNotificationsCount={2}
          userEmail={currentUser?.email || currentUserEmail}
          userName={currentUser?.name || 'Emerson'}
          userFullName={currentUser?.fullName || 'Emerson Rocha Dutra'}
          userRole={currentUser?.role || 'admin'}
          onLogout={handleLogout}
        />

        {/* Screen Content */}
        <main className="flex-1 px-4 overflow-y-auto">
          {activeTab === 'inicio' && (
            <DashboardScreen
              positions={positions}
              dividends={dividends}
              currency={currency}
              onToggleCurrency={(c) => setCurrency(c)}
              hideValues={hideValues}
              onToggleHideValues={() => setHideValues((v) => !v)}
              brokerBalances={brokerBalances}
              dailyMovers={dailyMovers}
              fxRate={fxRate}
              dollarChangePercent={dollarChangePercent}
              lastUpdated={lastUpdated}
              isUpdatingQuotes={isUpdatingQuotes}
              onRefreshQuotes={() => refreshQuotesFromGoogleFinance(true)}
              autoRefreshEnabled={autoRefreshEnabled}
              onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRemessaModal={() => setIsRemessaOpen(true)}
              onAddNewBroker={handleOpenAddBroker}
              onEditBroker={handleOpenEditBroker}
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
              onRefreshSync={() => refreshQuotesFromGoogleFinance(true)}
              onAddNewAsset={handleOpenAddAsset}
              onEditAsset={handleOpenEditAsset}
              onDeleteAsset={handleDeletePosition}
              isUpdatingQuotes={isUpdatingQuotes}
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
              onAddNewDividend={handleOpenAddDividend}
              onEditDividend={handleOpenEditDividend}
            />
          )}

          {activeTab === 'mais' && (
            <MaisScreen
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              onAddNewAsset={handleOpenAddAsset}
              onAddNewDividend={handleOpenAddDividend}
              onAddNewBroker={handleOpenAddBroker}
              onOpenRemessaModal={() => setIsRemessaOpen(true)}
              onRefreshQuotes={() => refreshQuotesFromGoogleFinance(true)}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              onOpenUserCrud={() => setIsUserCrudOpen(true)}
              isUpdatingQuotes={isUpdatingQuotes}
              lastUpdated={lastUpdated}
              fxRate={fxRate}
              positionsCount={positions.length}
              transactionsCount={transactions.length}
              brokersCount={brokerBalances.length}
              dividendsCount={dividends.length}
              userEmail={currentUser?.email || currentUserEmail}
              userName={currentUser?.name || 'Emerson'}
              userFullName={currentUser?.fullName || 'Emerson Rocha Dutra'}
              userCpf={currentUser?.cpf || '01576230171'}
              userRole={currentUser?.role || 'admin'}
              onLogout={handleLogout}
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
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              transactionsCount={transactions.length}
              onBackToMais={() => setActiveTab('mais')}
            />
          )}

          {activeTab === 'raiox' && (
            <RaioXScreen
              positions={positions}
              brokerBalances={brokerBalances}
              dividends={dividends}
              currency={currency}
              hideValues={hideValues}
              fxRate={fxRate}
              onNavigateLancar={(ticker) => {
                setPreselectedTicker(ticker);
                setActiveTab('lancar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSuccessToast={showToast}
              onBackToMais={() => setActiveTab('mais')}
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

      {/* CRUD Modals */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSave={handleSavePosition}
        onDelete={handleDeletePosition}
        editingPosition={editingPosition}
        fxRate={fxRate}
      />

      <DividendModal
        isOpen={isDividendModalOpen}
        onClose={() => setIsDividendModalOpen(false)}
        onSave={handleSaveDividend}
        onDelete={handleDeleteDividend}
        editingDividend={editingDividend}
      />

      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        onSave={handleSaveBroker}
        onDelete={handleDeleteBroker}
        editingBroker={editingBroker}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
        onEditTransaction={handleEditTransaction}
        onOpenNewOrder={() => {
          setIsHistoryModalOpen(false);
          setActiveTab('lancar');
        }}
      />

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
        onRefreshSync={() => refreshQuotesFromGoogleFinance(true)}
      />

      {/* Supabase & PostgreSQL Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        positions={positions}
        transactions={transactions}
        dividends={dividends}
        balances={brokerBalances}
        onDataLoadedFromSupabase={handleDataLoadedFromSupabase}
        onSuccessToast={showToast}
      />

      {/* Complete User CRUD Management Modal (Admin / Cliente) */}
      <UserCrudModal
        isOpen={isUserCrudOpen}
        onClose={() => setIsUserCrudOpen(false)}
        currentUser={currentUser}
        onUserChanged={loadUserProfile}
      />
    </div>
  );
}
