import { econTraderApi } from '@/lib/api/econ-trader';
import type {
  AccountFormData,
  Coin,
  OrderInformation,
  OrderStatus,
  Timestamp,
  TradingExchange,
  TradingMarket,
  TradingSymbol,
} from '@/types/account';
import { createBrowserLogger, dedupe } from '@an-oct/vani-kit';
import { transformBackendMarket, transformMarket, transformSymbol } from './helpers';

const logger = createBrowserLogger('ACCOUNT-SERVICE', {
  level: 'debug',
});

// ============================================================================
// Constants
// ============================================================================

const MASKED_SECRET_KEY = '************************************';

/**
 * Binance Coin-M futures symbols
 */
const BN_COIN_M_SYMBOLS: Record<string, boolean> = {
  // cspell:disable
  BTCUSD_PERPETUAL: true,
  ETHUSD_PERPETUAL: true,
  BNBUSD_PERPETUAL: true,
  SOLUSD_PERPETUAL: true,
  LTCUSD_PERPETUAL: true,
  HYPEUSD_PERPETUAL: true,
  AVAXUSD_PERPETUAL: true,
  LINKUSD_PERPETUAL: true,
  XRPUSD_PERPETUAL: true,
  ADAUSD_PERPETUAL: true,
  DOGEUSD_PERPETUAL: true,
  // cspell:enable
} as const;

/**
 * Binance USDT-M futures symbols
 */
const BN_USDS_M_SYMBOLS: Record<string, boolean> = {
  // cspell:disable
  BTCUSDT: true,
  ETHUSDT: true,
  BNBUSDT: true,
  SOLUSDT: true,
  LTCUSDT: true,
  HYPEUSDT: true,
  AVAXUSDT: true,
  LINKUSDT: true,
  XRPUSDT: true,
  ADAUSDT: true,
  DOGEUSDT: true,
  SUIUSDC: true,
  LTCUSDC: true,
  // cspell:enable
} as const;

/**
 * Maps API symbols to frontend trading symbols
 */
const SYMBOL_MAP: Record<string, TradingSymbol> = {
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
};

/**
 * Reverse mapping: frontend symbols to API symbols
 */
const REVERSE_SYMBOL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SYMBOL_MAP).map(([key, value]) => [value, key])
);

// ============================================================================
// Types
// ============================================================================

/**
 * Frontend Account type transformed from UserDataResponse
 * Note: Some fields like openOrders, orderHistory, etc. are placeholders
 * until the backend implements them
 */
export type Account = {
  id: string;
  name: string;
  apiKey: string;
  secretKey?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  exchange: TradingExchange;
  availableMarkets: Partial<Record<TradingMarket, TradingSymbol[]>>;
  balanceInformation: Partial<
    Record<
      TradingMarket,
      {
        asset: Coin;
        balance: number;
        available: number;
        inOrder: number;
      }[]
    >
  >;
  positionInformation: Partial<
    Record<
      TradingMarket,
      {
        symbol: TradingSymbol;
        side: 'long' | 'short';
        quantity: number;
        averagePrice: number;
        liquidationPrice: number;
        entryPrice: number;
        leverage: number;
        unrealizedPnl: number;
        realizedPnl: number;
        markPrice: number;
        positionInitialMargin: number;
        positionMaintenanceMargin: number;
      }[]
    >
  >;
  openOrders: Partial<Record<TradingMarket, OrderInformation[]>>;
  orderHistory: Partial<Record<TradingMarket, OrderInformation[]>>;
  // TODO: These fields are not yet implemented in the backend API
  positionHistory: Record<string, never>;
  transactionHistory: Record<string, never>;
};

// ============================================================================
// Transformation Helpers
// ============================================================================

/**
 * Filters symbols based on market type (Coin-M or USDS-M)
 */
function filterSymbolsByMarket(symbols: string[], market: TradingMarket): TradingSymbol[] {
  const isCoinM = market === 'BN_COIN_M';
  const symbolRegistry = isCoinM ? BN_COIN_M_SYMBOLS : BN_USDS_M_SYMBOLS;

  return symbols
    .map((symbol) => SYMBOL_MAP[symbol])
    .filter((symbol): symbol is TradingSymbol => Boolean(symbol && symbolRegistry[symbol]));
}

/**
 * Transforms API available symbols to frontend market structure
 */
function transformAvailableMarkets(
  availableSymbols: Record<string, string[]>
): Account['availableMarkets'] {
  return Object.fromEntries(
    Object.entries(availableSymbols)
      .map(([backendMarket, symbols]) => {
        const market: TradingMarket = transformMarket(backendMarket);
        const filteredSymbols = filterSymbolsByMarket(symbols, market);
        return [market, filteredSymbols];
      })
      .filter(([, symbols]) => (symbols as TradingSymbol[]).length > 0) // Remove empty markets
  );
}

/**
 * Transforms API balance data to frontend format
 */
function transformBalanceInformation(
  balances: Record<string, Array<{ asset: Coin; equity: number; availableBalance: number }>>
): Account['balanceInformation'] {
  return Object.fromEntries(
    Object.entries(balances).map(([market, balances]) => [
      transformMarket(market),
      balances.map((balance) => ({
        asset: balance.asset,
        balance: balance.equity,
        available: balance.availableBalance,
        inOrder: 0, // TODO: Calculate from open orders
      })),
    ])
  );
}

/**
 * Transforms API order data to frontend format
 */
function transformOrderInformation(
  orders: Record<
    string,
    Array<{
      exchangeOrderId: string;
      internalOrderId: string;
      side: 'BUY' | 'SELL';
      symbol: string;
      volume: number;
      reduceOnly: boolean;
      price?: number;
      stopPrice?: number;
      status: 'NEW' | 'FILLED' | 'CANCELLED' | 'PARTIALLY_FILLED';
      filled: number;
      avgPrice: number;
      entryTimestamp?: number;
      filledTimestamp?: number;
      lastUpdateTimestamp?: number;
    }>
  >
): Partial<Record<TradingMarket, OrderInformation[]>> {
  const result: Partial<Record<TradingMarket, OrderInformation[]>> = {};

  for (const [market, marketOrders] of Object.entries(orders)) {
    if (!marketOrders || marketOrders.length === 0) continue;

    result[transformMarket(market)] = marketOrders.map((order) => {
      // Determine order type based on price and stopPrice
      let type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' = 'MARKET';
      if (order.stopPrice) {
        // If it has a stop price, it's either STOP_LOSS or TAKE_PROFIT
        // We'll use STOP_LOSS as default since we can't determine the intent from the data
        type = 'STOP_LOSS';
      } else if (order.price) {
        type = 'LIMIT';
      }

      return {
        id: order.internalOrderId,
        symbol: transformSymbol(order.symbol),
        market: market as TradingMarket,
        side: order.side,
        type,
        status: order.status,
        quantity: order.volume,
        filledQuantity: order.filled,
        price: order.price,
        averagePrice: order.avgPrice || undefined,
        timeInForce: 'GTC' as const, // Default to GTC since not provided by backend
        createdAt: order.entryTimestamp || Date.now(),
        updatedAt: order.lastUpdateTimestamp || order.filledTimestamp || Date.now(),
      };
    });
  }

  return result;
}

/**
 * Transforms API position data to frontend format
 */
function transformPositionInformation(
  positions: Record<
    string,
    Array<{
      symbol: string;
      positionSide: 'LONG' | 'SHORT' | 'BOTH';
      volume: number;
      entryPrice: number;
      liquidationPrice: number;
      leverage: number;
      unRealizedProfit: number;
      markPrice?: number;
    }>
  >
): Account['positionInformation'] {
  return Object.fromEntries(
    Object.entries(positions).map(([market, positions]) => [
      transformMarket(market),
      positions.map((position) => ({
        symbol: transformSymbol(position.symbol),
        side: position.positionSide.toLowerCase() as 'long' | 'short', // Convert 'LONG'/'SHORT'/'BOTH' to 'long'/'short'
        quantity: position.volume,
        averagePrice: position.entryPrice,
        liquidationPrice: position.liquidationPrice,
        entryPrice: position.entryPrice,
        leverage: position.leverage,
        unrealizedPnl: position.unRealizedProfit,
        realizedPnl: 0, // TODO: Calculate from closed positions
        markPrice: position.markPrice ?? position.entryPrice, // Fallback to entryPrice if markPrice is undefined
        positionInitialMargin: 0, // TODO: Add to API response
        positionMaintenanceMargin: 0, // TODO: Add to API response
      })),
    ])
  );
}

/**
 * Transforms API account response to frontend Account type
 */
function transformAccount(apiAccount: {
  accountUniqueId: string;
  name: string;
  exchange: TradingExchange;
  apiKey: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  availableSymbols: Record<string, string[]>;
  balances: Record<string, Array<{ asset: Coin; equity: number; availableBalance: number }>>;
  positions: Record<
    string,
    Array<{
      symbol: string;
      positionSide: 'LONG' | 'SHORT' | 'BOTH';
      volume: number;
      entryPrice: number;
      liquidationPrice: number;
      leverage: number;
      unRealizedProfit: number;
      markPrice?: number;
    }>
  >;
  openOrders?: Record<
    string,
    Array<{
      exchangeOrderId: string;
      internalOrderId: string;
      side: 'BUY' | 'SELL';
      symbol: string;
      volume: number;
      reduceOnly: boolean;
      price?: number;
      stopPrice?: number;
      status: OrderStatus;
      filled: number;
      avgPrice: number;
      entryTimestamp?: number;
      filledTimestamp?: number;
      lastUpdateTimestamp?: number;
    }>
  >;
  orders?: Record<
    string,
    Array<{
      exchangeOrderId: string;
      internalOrderId: string;
      side: 'BUY' | 'SELL';
      symbol: string;
      volume: number;
      reduceOnly: boolean;
      price?: number;
      stopPrice?: number;
      status: OrderStatus;
      filled: number;
      avgPrice: number;
      entryTimestamp?: number;
      filledTimestamp?: number;
      lastUpdateTimestamp?: number;
    }>
  >;
}): Account {
  return {
    id: apiAccount.accountUniqueId,
    name: apiAccount.name,
    exchange: apiAccount.exchange,
    apiKey: apiAccount.apiKey,
    secretKey: MASKED_SECRET_KEY,
    isActive: apiAccount.active,
    createdAt: apiAccount.createdAt,
    updatedAt: apiAccount.updatedAt,
    availableMarkets: transformAvailableMarkets(apiAccount.availableSymbols),
    balanceInformation: transformBalanceInformation(apiAccount.balances),
    positionInformation: transformPositionInformation(apiAccount.positions),
    openOrders: apiAccount.openOrders ? transformOrderInformation(apiAccount.openOrders) : {},
    orderHistory: apiAccount.orders ? transformOrderInformation(apiAccount.orders) : {},
    // TODO: Implement these transformations when backend API supports them
    positionHistory: {} as Record<string, never>,
    transactionHistory: {} as Record<string, never>,
  };
}

/**
 * Transforms frontend markets to API format for updates
 */
function transformMarketsForApi(
  availableMarkets: Partial<Record<TradingMarket, TradingSymbol[]>>
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(availableMarkets).map(([market, symbols]) => [
      transformBackendMarket(market as TradingMarket),
      symbols.map((symbol) => REVERSE_SYMBOL_MAP[symbol]),
    ])
  );
}

// ============================================================================
// Service
// ============================================================================

/**
 * Account service for managing trading accounts
 */
export const accountService = {
  /**
   * Fetches all accounts for the current user
   * Uses deduplication to prevent concurrent requests
   */
  async getAccounts(): Promise<Account[]> {
    const response = await dedupe.asyncDeduplicator.call('account.getAccounts', async () => {
      return econTraderApi.getUserData();
    });

    return Object.values(response.accounts).map(transformAccount);
  },

  /**
   * Fetches a single account by ID
   * @param id - Account unique identifier
   * @throws {Error} If account is not found
   */
  async getAccountById(id: string): Promise<Account> {
    return await dedupe.asyncDeduplicator.call('account.getAccounts', async () => {
      const accounts = await this.getAccounts();
      const account = accounts.find((account) => account.id === id);

      logger.debug('Getting account by id', { id, account });

      if (!account) {
        throw new Error(`Account not found: ${id}`);
      }

      const exchangeData = await econTraderApi.getExchangeData(account.id);
      account.balanceInformation = transformBalanceInformation(exchangeData.balances);
      account.positionInformation = transformPositionInformation(exchangeData.positions);
      account.openOrders = transformOrderInformation(exchangeData.openOrders);
      account.orderHistory = transformOrderInformation(exchangeData.orders);
      logger.debug('Account data', JSON.stringify(account, null, 2));

      return account;
    });
  },

  /**
   * Updates available trading markets for an account
   * @param id - Account unique identifier
   * @param availableMarkets - New market configuration
   */
  async updateMarkets(
    id: string,
    availableMarkets: Partial<Record<TradingMarket, TradingSymbol[]>>
  ): Promise<void> {
    const updateData = transformMarketsForApi(availableMarkets);

    logger.debug('Updating markets', { id, updateData });

    await econTraderApi.updateMarkets(id, updateData);
  },

  /**
   * Creates a new trading account
   * @param data - Account creation data
   */
  async createAccount(data: AccountFormData): Promise<void> {
    await econTraderApi.registerApiKey({
      exchange: data.exchange,
      name: data.name,
      apiKey: data.apiKey,
      secretKey: data.secretKey ?? '',
    });
  },

  /**
   * Deletes a trading account
   * @param id - Account unique identifier
   */
  async deleteAccount(id: string): Promise<void> {
    await econTraderApi.deleteAccount(id);
  },

  /**
   * Updates account name
   * @param id - Account unique identifier
   * @param name - New account name
   */
  async updateAccount(id: string, name: string): Promise<void> {
    await econTraderApi.updateApiKey(id, name);
  },

  /**
   * Toggles account active status
   * @param id - Account unique identifier
   * @param active - New active status
   */
  async toggleAccountStatus(id: string, active: boolean): Promise<void> {
    await econTraderApi.toggleAccountStatus(id, active);
  },
};
