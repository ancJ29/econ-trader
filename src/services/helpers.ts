import { TradingMarket } from '@/types/account';

/**
 * Maps API market names to frontend market types
 */
const MARKET_MAP = {
  'Coin-M': 'BN_COIN_M',
  'USDS-M': 'BN_USDS_M',
} as const;

/**
 * Reverse mapping: frontend markets to API market names
 */
const REVERSE_MARKET_MAP = Object.fromEntries(
  Object.entries(MARKET_MAP).map(([key, value]) => [value, key])
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
