import { z } from 'zod';

// Enums
export const TradingExchangeSchema = z.enum(['Binance', 'Bybit']);

export const TradingMarketSchema = z.enum([
  // cspell:disable
  'BN_SPOT',
  'BN_USDS_M',
  'BN_COIN_M',
  'BB_USDT_PERP',
  'BB_USDC_PERP',
  'BB_Perpetual',
  'BB_SPOT',
]);

export const CoinSchema = z.enum([
  'USDT',
  'USDC',
  'USD',
  'BTC',
  'ETH',
  'BNB',
  'SOL',
  'LTC',
  'HYPE',
  'AVAX',
  'LINK',
  'XRP',
  'ADA',
  'DOGE',
]);

export const TradingSymbolSchema = z.enum([
  // cspell:disable
  // For Spot
  'BTC_USDT',
  'ETH_USDT',
  'BNB_USDT',
  'SOL_USDT',
  'LTC_USDT',
  'HYPE_USDT',
  'AVAX_USDT',
  'LINK_USDT',
  'XRP_USDT',
  'ADA_USDT',
  'DOGE_USDT',
  // For Binance COIN-M Futures
  'BTCUSD_PERPETUAL',
  'ETHUSD_PERPETUAL',
  'BNBUSD_PERPETUAL',
  'SOLUSD_PERPETUAL',
  'LTCUSD_PERPETUAL',
  'HYPEUSD_PERPETUAL',
  'AVAXUSD_PERPETUAL',
  'LINKUSD_PERPETUAL',
  'XRPUSD_PERPETUAL',
  'ADAUSD_PERPETUAL',
  'DOGEUSD_PERPETUAL',
  // For Binance USDⓈ-M Futures and BYBIT USDT Perpetual (Linear)
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'LTCUSDT',
  'HYPEUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SUIUSDC',
  'LTCUSDC',
  // For BYBIT USDC Perpetual (Linear)
  'BTC-PERP',
  'ETH-PERP',
  'BNB-PERP',
  'SOL-PERP',
  'LTC-PERP',
  'HYPE-PERP',
  'AVAX-PERP',
  'LINK-PERP',
  'XRP-PERP',
  'ADA-PERP',
  'DOGE-PERP',
  // For Perpetual (Inverse)
  'BTCUSD',
  'ETHUSD',
  'BNBUSD',
  'SOLUSD',
  'LTCUSD',
  'HYPEUSD',
  'AVAXUSD',
  'LINKUSD',
  'XRPUSD',
  'ADAUSD',
  'DOGEUSD',
  // cspell:enable
]);

export const OrderStatusSchema = z.enum(['NEW', 'FILLED', 'CANCELED', 'PARTIALLY_FILLED']);

export const OrderTypeSchema = z.enum(['market', 'limit', 'stop_loss', 'take_profit']);

export const OrderSideSchema = z.enum(['BUY', 'SELL']);

export const TimeInForceSchema = z.enum(['GTC', 'IOC', 'FOK']);

export const PositionSideSchema = z.enum(['long', 'short']);

export const TransactionTypeSchema = z.enum(['trade', 'fee', 'funding', 'swap']);

// Balance Information
export const BalanceInformationSchema = z.object({
  asset: CoinSchema,
  balance: z.number().nonnegative(),
  available: z.number().nonnegative(),
  inOrder: z.number().nonnegative(),
});

// Position Information
export const PositionInformationSchema = z.object({
  symbol: TradingSymbolSchema,
  side: PositionSideSchema,
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  liquidationPrice: z.number().positive(),
  entryPrice: z.number().positive(),
  leverage: z.number().positive().int(),
  unrealizedPnl: z.number(),
  realizedPnl: z.number(),
  markPrice: z.number().positive(),
  positionInitialMargin: z.number().nonnegative(),
  positionMaintenanceMargin: z.number().nonnegative(),
});

// Order Information
export const OrderInformationSchema = z.object({
  id: z.uuid(),
  symbol: TradingSymbolSchema,
  market: TradingMarketSchema,
  side: OrderSideSchema,
  type: OrderTypeSchema,
  status: OrderStatusSchema,
  quantity: z.number().positive(),
  filledQuantity: z.number().nonnegative(),
  price: z.number().positive().optional(),
  averagePrice: z.number().positive().optional(),
  timeInForce: TimeInForceSchema,
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

// Position History
export const PositionHistorySchema = z.object({
  id: z.uuid(),
  symbol: TradingSymbolSchema,
  market: TradingMarketSchema,
  side: PositionSideSchema,
  quantity: z.number().positive(),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive(),
  realizedPnl: z.number(),
  leverage: z.number().positive().int(),
  openedAt: z.number().positive(),
  closedAt: z.number().positive(),
});

// Transaction History
export const TransactionHistorySchema = z.object({
  id: z.uuid(),
  type: TransactionTypeSchema,
  symbol: TradingSymbolSchema,
  market: TradingMarketSchema,
  amount: z.number(),
  coin: CoinSchema,
  side: OrderSideSchema.optional(),
  price: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  description: z.string(),
  timestamp: z.number().positive(),
});

// Account Form Data
export const AccountFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  exchange: TradingExchangeSchema,
  apiKey: z.string().min(1, 'API Key is required'),
  secretKey: z.string().optional(),
});

// Complete Account Schema
// Note: z.record() in Zod already allows partial keys (not all enum values need to be present)
// This correctly represents TypeScript's Partial<Record<TradingMarket, ...>>
export const AccountSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  exchange: TradingExchangeSchema,
  availableMarkets: z.partialRecord(TradingMarketSchema, z.array(TradingSymbolSchema)),
  apiKey: z.string(),
  secretKey: z.string().optional(),
  balanceInformation: z
    .partialRecord(TradingMarketSchema, z.array(BalanceInformationSchema))
    .optional(),
  positionInformation: z
    .partialRecord(TradingMarketSchema, z.array(PositionInformationSchema))
    .optional(),
  openOrders: z.partialRecord(TradingMarketSchema, z.array(OrderInformationSchema)).optional(),
  orderHistory: z.partialRecord(TradingMarketSchema, z.array(OrderInformationSchema)).optional(),
  positionHistory: z.partialRecord(TradingMarketSchema, z.array(PositionHistorySchema)).optional(),
  transactionHistory: z
    .partialRecord(TradingMarketSchema, z.array(TransactionHistorySchema))
    .optional(),
  isActive: z.boolean(),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

// Response Schemas
export const AccountsResponseSchema = z.array(AccountSchema);
export const AccountResponseSchema = AccountSchema;

// Type exports
export type Account = z.infer<typeof AccountSchema>;
export type AccountResponse = z.infer<typeof AccountResponseSchema>;
export type AccountsResponse = z.infer<typeof AccountsResponseSchema>;
export type AccountFormData = z.infer<typeof AccountFormDataSchema>;
export type BalanceInformation = z.infer<typeof BalanceInformationSchema>;
export type PositionInformation = z.infer<typeof PositionInformationSchema>;
export type OrderInformation = z.infer<typeof OrderInformationSchema>;
export type PositionHistory = z.infer<typeof PositionHistorySchema>;
export type TransactionHistory = z.infer<typeof TransactionHistorySchema>;
