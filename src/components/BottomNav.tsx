import React from 'react';
import { LayoutGrid, PieChart, Banknote, PlusCircle, Sliders } from 'lucide-react';

export type TabKey = 'inicio' | 'carteira' | 'proventos' | 'lancar' | 'raiox';

interface BottomNavProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'inicio', label: 'Início', icon: LayoutGrid },
    { key: 'carteira', label: 'Carteira', icon: PieChart },
    { key: 'proventos', label: 'Proventos', icon: Banknote },
    { key: 'lancar', label: 'Lançar', icon: PlusCircle },
    { key: 'raiox', label: 'Raio-X', icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto glass-nav px-3 pt-2 pb-5 border-t border-[#1e293b] select-none">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChangeTab(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#38bdf8] scale-105'
                  : 'text-[#94a3b8] hover:text-[#d4e4fa]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#38bdf8]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-display tracking-tight transition-colors ${
                  isActive ? 'font-bold text-[#38bdf8]' : 'font-medium text-[#94a3b8]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
