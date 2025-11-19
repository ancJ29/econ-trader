import { BackendSymbol } from '@/lib/api/econ-trader';
import { TradingMarket, TradingSymbol } from '@/types/account';

/**
 * Maps API market names to frontend market types
 */
const MARKET_MAP = {
  'Coin-M': 'BN_COIN_M',
  'USDS-M': 'BN_USDS_M',
} as const;

const SYMBOL_MAP = {
  // cspell:disable
  BTCUSD_PERP: 'BTCUSD_PERPETUAL',
  ETHUSD_PERP: 'ETHUSD_PERPETUAL',
  BNBUSD_PERP: 'BNBUSD_PERPETUAL',
  SOLUSD_PERP: 'SOLUSD_PERPETUAL',
  LTCUSD_PERP: 'LTCUSD_PERPETUAL',
  HYPEUSD_PERP: 'HYPEUSD_PERPETUAL',
  AVAXUSD_PERP: 'AVAXUSD_PERPETUAL',
  LINKUSD_PERP: 'LINKUSD_PERPETUAL',
  XRPUSD_PERP: 'XRPUSD_PERPETUAL',
  ADAUSD_PERP: 'ADAUSD_PERPETUAL',
  DOGEUSD_PERP: 'DOGEUSD_PERPETUAL',
  BTCUSDT: 'BTCUSDT',
  ETHUSDT: 'ETHUSDT',
  BNBUSDT: 'BNBUSDT',
  SOLUSDT: 'SOLUSDT',
  LTCUSDT: 'LTCUSDT',
  HYPEUSDT: 'HYPEUSDT',
  AVAXUSDT: 'AVAXUSDT',
  LINKUSDT: 'LINKUSDT',
  XRPUSDT: 'XRPUSDT',
  ADAUSDT: 'ADAUSDT',
  DOGEUSDT: 'DOGEUSDT',
  SUIUSDC: 'SUIUSDC',
  LTCUSDC: 'LTCUSDC',
  // cspell:enable
} as const;

/**
 * Reverse mapping: frontend markets to API market names
 */
const REVERSE_MARKET_MAP = Object.fromEntries(
  Object.entries(MARKET_MAP).map(([key, value]) => [value, key])
);

const REVERSE_SYMBOL_MAP = Object.fromEntries(
  Object.entries(SYMBOL_MAP).map(([key, value]) => [value, key])
);

export const transformMarket = (backendMarket: string): TradingMarket => {
  if (backendMarket in MARKET_MAP) {
    return MARKET_MAP[backendMarket as keyof typeof MARKET_MAP];
  }
  throw new Error(`Invalid market: ${backendMarket}`);
};

export const transformBackendMarket = (frontendMarket: TradingMarket): string => {
  if (frontendMarket in REVERSE_MARKET_MAP) {
    return REVERSE_MARKET_MAP[frontendMarket as keyof typeof REVERSE_MARKET_MAP];
  }
  throw new Error(`Invalid market: ${frontendMarket}`);
};

export const transformSymbol = (backendSymbol: string): TradingSymbol => {
  if (backendSymbol in SYMBOL_MAP) {
    return SYMBOL_MAP[backendSymbol as keyof typeof SYMBOL_MAP];
  }
  throw new Error(`Invalid symbol: ${backendSymbol}`);
};

export const transformBackendSymbol = (frontendSymbol: string): BackendSymbol => {
  if (frontendSymbol in REVERSE_SYMBOL_MAP) {
    return REVERSE_SYMBOL_MAP[
      frontendSymbol as keyof typeof REVERSE_SYMBOL_MAP
    ] as unknown as BackendSymbol;
  }
  throw new Error(`Invalid symbol: ${frontendSymbol}`);
};
