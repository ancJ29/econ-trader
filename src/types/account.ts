// Trading exchange types
export type TradingExchange = 'Binance' | 'Bybit';

// Trading market types
export type TradingMarket =
  // For Binance
  // Document: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-api-information
  | 'BN_SPOT' // Spot
  // USDⓈ-M Futures
  // Document: https://developers.binance.com/docs/derivatives/usds-margined-futures/general-info
  | 'BN_USDS_M'
  // COIN-M Futures
  // Document: https://developers.binance.com/docs/derivatives/coin-margined-futures/general-info
  | 'BN_COIN_M'
  // For Bybit
  // Document: https://bybit-exchange.github.io/docs/v5/intro#current-api-coverage
  | 'BB_USDT_PERP' // USDT Perpetual (Linear)
  | 'BB_USDC_PERP' // USDC Perpetual (Linear)
  // | 'BB_USDC_Futures' // USDC Futures (Linear) / Not supported yet
  | 'BB_Perpetual' // Perpetual (Inverse)
  // | 'BB_Futures' // Futures (Inverse) / Not supported yet
  | 'BB_SPOT'; // Spot

// Coin types
export type Coin =
  | 'USDT'
  | 'USDC'
  | 'USD'
  | 'BTC'
  | 'ETH'
  | 'BNB'
  | 'SOL'
  | 'LTC'
  | 'HYPE'
  | 'AVAX'
  | 'LINK'
  | 'XRP'
  | 'ADA'
  | 'DOGE';

// Trading symbol types
export type TradingSymbol =
  // For Spot
  | 'BTC_USDT'
  | 'ETH_USDT'
  | 'BNB_USDT'
  | 'SOL_USDT'
  | 'LTC_USDT'
  | 'HYPE_USDT'
  | 'AVAX_USDT'
  | 'LINK_USDT'
  | 'XRP_USDT'
  | 'ADA_USDT'
  | 'DOGE_USDT'
  // For Binance COIN-M Futures
  | 'BTCUSD_PERPETUAL'
  | 'ETHUSD_PERPETUAL'
  | 'BNBUSD_PERPETUAL'
  | 'SOLUSD_PERPETUAL'
  | 'LTCUSD_PERPETUAL'
  | 'HYPEUSD_PERPETUAL'
  | 'AVAXUSD_PERPETUAL'
  | 'LINKUSD_PERPETUAL'
  | 'XRPUSD_PERPETUAL'
  | 'ADAUSD_PERPETUAL'
  | 'DOGEUSD_PERPETUAL'
  // For Binance USDⓈ-M Futures and BYBIT USDT Perpetual (Linear)
  | 'BTCUSDT'
  | 'ETHUSDT'
  | 'BNBUSDT'
  | 'SOLUSDT'
  | 'LTCUSDT'
  | 'HYPEUSDT'
  | 'AVAXUSDT'
  | 'LINKUSDT'
  | 'XRPUSDT'
  | 'ADAUSDT'
  | 'DOGEUSDT'
  // For BYBIT USDC Perpetual (Linear)
  | 'BTC-PERP'
  | 'ETH-PERP'
  | 'BNB-PERP'
  | 'SOL-PERP'
  | 'LTC-PERP'
  | 'HYPE-PERP'
  | 'AVAX-PERP'
  | 'LINK-PERP'
  | 'XRP-PERP'
  | 'ADA-PERP'
  | 'DOGE-PERP'
  // For Perpetual (Inverse)
  | 'BTCUSD'
  | 'ETHUSD'
  | 'BNBUSD'
  | 'SOLUSD'
  | 'LTCUSD'
  | 'HYPEUSD'
  | 'AVAXUSD'
  | 'LINKUSD'
  | 'XRPUSD'
  | 'ADAUSD'
  | 'DOGEUSD';

// Timestamp type
export type Timestamp = number;

// Balance information for a coin in a specific market
export type BalanceInformation = {
  symbol: Coin;
  balance: number;
  available: number;
  inOrder: number;
};

// Position information for a trading symbol
export type PositionInformation = {
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
};

// Main account type
export type Account = {
  id: string; // UUID
  name: string;
  exchange: TradingExchange;
  availableMarkets: Partial<Record<TradingMarket, TradingSymbol[]>>;
  apiKey: string;
  secretKey?: string; // Optional, should be hidden in UI, but must be provided when registering new account
  balanceInformation?: Partial<Record<TradingMarket, BalanceInformation[]>>;
  positionInformation?: Partial<Record<TradingMarket, PositionInformation[]>>;
  openOrders?: Partial<Record<TradingMarket, OrderInformation[]>>;
  orderHistory?: Partial<Record<TradingMarket, OrderInformation[]>>;
  positionHistory?: Partial<Record<TradingMarket, PositionHistory[]>>;
  transactionHistory?: Partial<Record<TradingMarket, TransactionHistory[]>>;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Form data type for creating/updating accounts
export type AccountFormData = {
  name: string;
  exchange: TradingExchange;
  apiKey: string;
  secretKey?: string;
};

// Order status types
export type OrderStatus = 'open' | 'filled' | 'cancelled' | 'partially_filled';

// Order type
export type OrderType = 'market' | 'limit' | 'stop_loss' | 'take_profit';

// Order side
export type OrderSide = 'buy' | 'sell';

// Time in force types
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';

// Order information
export type OrderInformation = {
  id: string;
  symbol: TradingSymbol;
  market: TradingMarket;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  quantity: number;
  filledQuantity: number;
  price?: number;
  averagePrice?: number;
  timeInForce: TimeInForce;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Position history record
export type PositionHistory = {
  id: string;
  symbol: TradingSymbol;
  market: TradingMarket;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  leverage: number;
  openedAt: Timestamp;
  closedAt: Timestamp;
};

// Transaction types
export type TransactionType = 'trade' | 'fee' | 'funding' | 'swap';

// Transaction history record
export type TransactionHistory = {
  id: string;
  type: TransactionType;
  symbol: TradingSymbol;
  market: TradingMarket;
  amount: number;
  coin: Coin;
  side?: OrderSide;
  price?: number;
  quantity?: number;
  description: string;
  timestamp: Timestamp;
};
