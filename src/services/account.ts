import { econTraderApi } from '@/lib/api/econ-trader';
import type {
  AccountFormData,
  OrderInformation,
  OrderStatus,
  Timestamp,
  TradingExchange,
  TradingMarket,
} from '@/types/account';
import { createBrowserLogger, dedupe } from '@an-oct/vani-kit';
import { transformBackendMarket, transformMarket } from './helpers';

const logger = createBrowserLogger('ACCOUNT-SERVICE', {
  level: 'silent',
});

// ============================================================================
// Constants
// ============================================================================

const MASKED_SECRET_KEY = '************************************';

/**
 * Binance string-M futures symbols
 */
export const BN_COIN_M_SYMBOLS: Record<string, boolean> = {
  // cspell:disable
  BTCUSD_PERP: true,
  ETHUSD_PERP: true,
  BNBUSD_PERP: true,
  // cspell:enable
} as const;

/**
 * Binance USDT-M futures symbols
 */
export const BN_USDS_M_SYMBOLS: Record<string, boolean> = {
  // cspell:disable
  BTCUSDT: true,
  ETHUSDT: true,
  BNBUSDT: true,
  SOLUSDT: true,
  LTCUSDT: true,
  AVAXUSDT: true,
  LINKUSDT: true,
  XRPUSDT: true,
  ADAUSDT: true,
  DOGEUSDT: true,
  // cspell:enable
} as const;

/**
 * Bybit Linear futures symbols
 */
export const BB_LINEAR_SYMBOLS: Record<string, boolean> = {
  // cspell:disable
  BTCUSDT: true,
  ETHUSDT: true,
  BNBUSDT: true,
  SOLUSDT: true,
  LTCUSDT: true,
  AVAXUSDT: true,
  LINKUSDT: true,
  XRPUSDT: true,
  ADAUSDT: true,
  DOGEUSDT: true,
  // cspell:enable
} as const;

/**
 * Bybit Inverse futures symbols
 */
export const BB_INVERSE_SYMBOLS: Record<string, boolean> = {
  // cspell:disable
  BTCUSD: true,
  ETHUSD: true,
  BNBUSD: true,
  // cspell:enable
} as const;
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
  availableMarkets: Partial<Record<TradingMarket, string[]>>;
  balanceInformation: Partial<
    Record<
      TradingMarket,
      {
        asset: string;
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
        symbol: string;
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
function filterSymbolsByMarket(symbols: string[], market: TradingMarket): string[] {
  switch (market) {
    case 'BN_COIN_M':
      return symbols.filter((symbol) => BN_COIN_M_SYMBOLS[symbol]);
    case 'BN_USDS_M':
      return symbols.filter((symbol) => BN_USDS_M_SYMBOLS[symbol]);
    case 'BB_Linear':
      return symbols.filter((symbol) => BB_LINEAR_SYMBOLS[symbol]);
    case 'BB_Inverse':
      return symbols.filter((symbol) => BB_INVERSE_SYMBOLS[symbol]);
    default:
      return symbols;
  }
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
      .filter(([, symbols]) => (symbols as string[]).length > 0) // Remove empty markets
  );
}

/**
 * Transforms API balance data to frontend format
 */
function transformBalanceInformation(
  balances: Record<string, Array<{ asset: string; equity: number; availableBalance: number }>>
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
      status: 'NEW' | 'FILLED' | 'CANCELED' | 'PARTIALLY_FILLED';
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
        symbol: order.symbol,
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
        symbol: position.symbol,
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
  balances: Record<string, Array<{ asset: string; equity: number; availableBalance: number }>>;
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
  availableMarkets: Partial<Record<TradingMarket, string[]>>
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(availableMarkets).map(([market, symbols]) => [
      transformBackendMarket(market as TradingMarket),
      symbols,
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
    if (!sessionStorage.getItem('token')) {
      return [];
    }
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
    availableMarkets: Partial<Record<TradingMarket, string[]>>
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
