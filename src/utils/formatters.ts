import { AssetClass, Currency, Market } from '../types';

export function formatCurrency(
  value: number,
  currency: Currency = 'BRL',
  hideValues: boolean = false,
  showDecimals: boolean = true
): string {
  if (hideValues) {
    return currency === 'BRL' ? 'R$ •••••••' : 'US$ •••••••';
  }

  const absVal = Math.abs(value);
  const formattedNumber = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absVal);

  const prefix = value < 0 ? '-' : '';
  const currPrefix = currency === 'BRL' ? 'R$' : 'US$';

  return `${prefix}${currPrefix} ${formattedNumber}`;
}

export function formatPlainCurrency(
  value: number,
  currency: Currency = 'BRL',
  hideValues: boolean = false
): string {
  if (hideValues) return '••••••';
  return formatCurrency(value, currency, false);
}

export function formatPercent(value: number, showPlus: boolean = true): string {
  const sign = value > 0 && showPlus ? '+' : '';
  return `${sign}${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

export function formatShortNumber(val: number): string {
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (val >= 1_000) {
    return `${Math.round(val / 1_000)}k`;
  }
  return val.toString();
}

export function getAssetClassBadgeStyle(assetClass: AssetClass) {
  switch (assetClass) {
    case 'FII':
      return 'bg-[#10b981]/15 text-[#56e5a9] border-[#10b981]/30';
    case 'Ação':
      return 'bg-[#38bdf8]/15 text-[#8ed5ff] border-[#38bdf8]/30';
    case 'Stock':
      return 'bg-[#f59e0b]/15 text-[#ffb95f] border-[#f59e0b]/30';
    case 'REIT':
      return 'bg-[#f59e0b]/15 text-[#fcd34d] border-[#f59e0b]/30';
    case 'ETF':
      return 'bg-[#6366f1]/15 text-[#a5b4fc] border-[#6366f1]/30';
    case 'BDR':
      return 'bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

export function getMarketFlag(market: Market) {
  return market === 'BR' ? '🇧🇷' : '🇺🇸';
}
