// Trading exchange types
// cspell:disable
export type TradingExchange = 'Binance' | 'Bybit';

// Trading market types
export type TradingMarket =
  // For Binance: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-api-information
  | 'BN_USDS_M' // USDⓈ-M Futures
  | 'BN_COIN_M' // COIN-M Futures
  // For Bybit: https://bybit-exchange.github.io/docs/v5/intro#current-api-coverage
  | 'BB_Linear' // USDT Perpetual (Linear)
  | 'BB_Inverse'; // Perpetual (Inverse)

// Timestamp type
export type Timestamp = number;

// Balance information for a coin in a specific market
export type BalanceInformation = {
  asset: string;
  balance: number;
  available: number;
  inOrder: number;
};

// Position information for a trading symbol
export type PositionInformation = {
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
};

// Main account type
export type Account = {
  id: string; // UUID
  name: string;
  exchange: TradingExchange;
  availableMarkets: Partial<Record<TradingMarket, string[]>>;
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
export type OrderStatus = 'NEW' | 'FILLED' | 'CANCELED' | 'PARTIALLY_FILLED';

// Order type
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';

// Order side
export type OrderSide = 'BUY' | 'SELL';

// Time in force types
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';

// Order information
export type OrderInformation = {
  id: string;
  symbol: string;
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
  symbol: string;
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
  symbol: string;
  market: TradingMarket;
  amount: number;
  coin: string;
  side?: OrderSide;
  price?: number;
  quantity?: number;
  description: string;
  timestamp: Timestamp;
};
