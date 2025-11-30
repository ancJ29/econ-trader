import {
  BB_INVERSE_SYMBOLS,
  BB_LINEAR_SYMBOLS,
  BN_COIN_M_SYMBOLS,
  BN_USDS_M_SYMBOLS,
} from '@/services/account';
import type { TradingExchange, TradingMarket } from '@/types/account';

// cspell:disable
export const EXCHANGE_MARKETS: Record<TradingExchange, TradingMarket[]> = {
  Binance: ['BN_USDS_M', 'BN_COIN_M'],
  Bybit: ['BB_Linear', 'BB_Inverse'],
};

export const MARKET_SYMBOLS: Record<TradingMarket, string[]> = {
  BN_USDS_M: Object.keys(BN_USDS_M_SYMBOLS),
  BN_COIN_M: Object.keys(BN_COIN_M_SYMBOLS),
  BB_Linear: Object.keys(BB_LINEAR_SYMBOLS),
  BB_Inverse: Object.keys(BB_INVERSE_SYMBOLS),
};

export const MARKET_LABELS: Record<TradingMarket, string> = {
  BN_USDS_M: 'Binance USDⓈ-M Futures',
  BN_COIN_M: 'Binance COIN-M Futures',
  BB_Linear: 'Bybit USDT Perpetual',
  BB_Inverse: 'Bybit Inverse Perpetual',
};
