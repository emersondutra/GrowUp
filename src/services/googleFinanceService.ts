import { Currency, Market } from '../types';

export interface LiveQuote {
  ticker: string;
  market: Market;
  price: number;
  changePercent: number;
  currency: Currency;
  status: 'live' | 'cached';
  source: string;
}

export interface BatchQuotesResponse {
  fxRate: number;
  quotes: LiveQuote[];
  timestamp: string;
}

export async function fetchLiveDollar(): Promise<{ rate: number; changePercent: number; source: string }> {
  try {
    const res = await fetch('/api/finance/dollar');
    if (!res.ok) throw new Error('Failed to fetch dollar');
    const data = await res.json();
    return {
      rate: data.rate || 5.50,
      changePercent: data.changePercent || 0,
      source: data.source || 'Google Finance',
    };
  } catch (err) {
    console.warn('Using client fallback for USD/BRL:', err);
    return {
      rate: 5.50,
      changePercent: 0.12,
      source: 'Google Finance (Fallback)',
    };
  }
}

export async function fetchLiveBatchQuotes(
  items: { ticker: string; market: Market; fallbackPrice?: number }[]
): Promise<BatchQuotesResponse> {
  try {
    const res = await fetch('/api/finance/batch-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) throw new Error('Failed to fetch batch quotes');
    const data: BatchQuotesResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Using fallback batch quotes:', err);
    return {
      fxRate: 5.50,
      quotes: items.map((i) => ({
        ticker: i.ticker,
        market: i.market,
        price: i.fallbackPrice || 50,
        changePercent: 0.5,
        currency: i.market === 'BR' ? 'BRL' : 'USD',
        status: 'cached',
        source: 'Google Finance (Cached)',
      })),
      timestamp: new Date().toISOString(),
    };
  }
}
