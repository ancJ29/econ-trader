import { createBrowserLogger } from '@an-oct/vani-kit';
import { z } from 'zod';
import { OrderSideSchema, OrderStatusSchema } from '../schemas/account';
import { BaseApiClient } from './base';

const logger = createBrowserLogger('ECON-TRADER-API', {
  level: 'silent',
});
export const UserDataSchema = z.object({
  // blank object
});

export const ExchangeSchema = z.enum(['Binance', 'Bybit']);
export const MarketSchema = z.enum(['Coin-M', 'USDS-M', 'Linear', 'Inverse']);

export const BalanceSchema = z.object({
  asset: z.string(),
  balance: z.number(),
  equity: z.number(),
  unrealizedPnl: z.number(),
  availableBalance: z.number(),
  updateTime: z.number(),
});

export const PositionSchema = z.object({
  symbol: z.string(),
  positionSide: z.enum(['LONG', 'SHORT', 'BOTH']),
  volume: z.number(),
  unRealizedProfit: z.number(),
  entryPrice: z.number(),
  markPrice: z.number().optional(),
  breakEvenPrice: z.number().optional(),
  liquidationPrice: z.number(),
  isHedgedMode: z.boolean().optional(),
  leverage: z.number(),
  marginAsset: z.string().optional(),
});

export const OrderSchema = z.object({
  exchangeOrderId: z.string(),
  internalOrderId: z.string(),
  side: OrderSideSchema,
  symbol: z.string(),
  volume: z.number(),
  reduceOnly: z.boolean(),
  price: z.number().nonnegative().optional(),
  stopPrice: z.number().nonnegative().optional(),
  status: OrderStatusSchema,
  filled: z.number(),
  avgPrice: z.number().nonnegative(),
  entryTimestamp: z.number().positive().optional(),
  filledTimestamp: z.number().positive().optional(),
  lastUpdateTimestamp: z.number().positive().optional(),
});
export const ReservationSchema = z.object({
  id: z.string(),
  uniqueCode: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
  accountId: z.string(),
  market: MarketSchema,
  triggerType: z.enum(['actual_vs_forecast', 'actual_vs_previous', 'actual_vs_specific']),
  condition: z.enum(['greater', 'less']),
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  volume: z.number(),
  orderType: z.enum(['LIMIT', 'MARKET']),
  enabled: z.boolean(),
  createdAt: z.number().positive(),
  specificValue: z.number().optional(),
  limitPrice: z.number().optional(),
});

export type Reservation = z.infer<typeof ReservationSchema>;

export const AccountSchema = z.object({
  apiKey: z.string(),
  name: z.string(),
  active: z.boolean(),
  availableSymbols: z.partialRecord(MarketSchema, z.array(z.string())),
  accountUniqueId: z.string(),
  balances: z.partialRecord(MarketSchema, BalanceSchema.array()),
  positions: z.partialRecord(MarketSchema, PositionSchema.array()),
  orders: z.partialRecord(MarketSchema, OrderSchema.array()),
  openOrders: z.partialRecord(MarketSchema, OrderSchema.array()),
  exchange: ExchangeSchema,
  markets: z.array(MarketSchema),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

export const UserDataResponseSchema = z.object({
  reservations: z.record(z.string(), z.array(ReservationSchema)).optional(),
  accounts: z.record(z.string(), AccountSchema),
});

export const ExchangeDataSchema = z.object({
  balances: z.partialRecord(MarketSchema, BalanceSchema.array()),
  positions: z.partialRecord(MarketSchema, PositionSchema.array()),
  orders: z.partialRecord(MarketSchema, OrderSchema.array()),
  openOrders: z.partialRecord(MarketSchema, OrderSchema.array()),
});

export type UserData = z.infer<typeof UserDataSchema>;
export type UserDataResponse = z.infer<typeof UserDataResponseSchema>;

class EconTraderApiClient extends BaseApiClient {
  async getUserData(): Promise<UserDataResponse> {
    logger.debug('Getting user data...');
    return this.get('/api/econ-trader/user-data', undefined, UserDataResponseSchema, undefined, {
      cacheKey: 'econ-trader.getUserData',
      ttl: 300_000, // 5 minutes cache TTL
    });
  }

  async registerApiKey({
    exchange,
    name,
    apiKey,
    secretKey,
  }: {
    exchange: 'Binance' | 'Bybit';
    name: string;
    apiKey: string;
    secretKey: string;
  }): Promise<void> {
    logger.debug('Registering API key...', { exchange, name, apiKey });
    await this.post('/api/econ-trader/register-api-key', {
      exchange,
      name,
      apiKey,
      secretKey,
    });
    this.clearCache();
  }

  async updateApiKey(accountUniqueId: string, name: string): Promise<void> {
    logger.debug('Updating API key...', { accountUniqueId, name });
    await this.put('/api/econ-trader/update-api-keys', {
      accountUniqueId,
      name,
    });
    this.clearCache();
  }

  async updateMarkets(id: string, availableSymbols: Record<string, string[]>): Promise<void> {
    logger.debug('Updating markets...', { id, availableSymbols });
    await this.put('/api/econ-trader/update-market-config', {
      accountUniqueId: id,
      availableSymbols,
    });
    this.clearCache();
  }

  async toggleAccountStatus(accountUniqueId: string, active: boolean): Promise<void> {
    logger.debug('Toggling account status...', { accountUniqueId });
    await this.put('/api/econ-trader/update-api-keys', {
      accountUniqueId,
      active,
    });
    this.clearCache();
  }

  async deleteAccount(accountUniqueId: string): Promise<void> {
    logger.debug('Deleting account...', { accountUniqueId });
    await this.delete('/api/econ-trader/delete-api-keys', {
      accountUniqueId,
    });
    this.clearCache();
  }

  async getExchangeData(accountUniqueId: string) {
    logger.debug('Getting exchange data...');
    return this.get(
      `/api/econ-trader/exchange-data/${accountUniqueId}`,
      undefined,
      ExchangeDataSchema,
      undefined,
      {
        cacheKey: `econ-trader.getExchangeData.${accountUniqueId}`,
        ttl: 60_000, // 1 minute cache TTL
      }
    );
  }

  async createReservation(data: Omit<Reservation, 'id' | 'createdAt'>): Promise<void> {
    logger.debug('Creating reservation...', {
      uniqueCode: data.uniqueCode,
      eventCode: data.eventCode,
    });
    await this.post('/api/econ-trader/add-reservation', data);
    this.clearCache();
  }

  async updateReservation(
    data: Pick<Reservation, 'uniqueCode' | 'id'> &
      Partial<Omit<Reservation, 'id' | 'uniqueCode' | 'createdAt'>>
  ): Promise<void> {
    logger.debug('Updating reservation...', { uniqueCode: data.uniqueCode, id: data.id });
    await this.put('/api/econ-trader/update-reservation', data);
    this.clearCache();
  }

  async deleteReservation(data: Pick<Reservation, 'uniqueCode' | 'id'>): Promise<void> {
    logger.debug('Deleting reservation...', { uniqueCode: data.uniqueCode, id: data.id });
    await this.delete('/api/econ-trader/delete-reservation', data);
    this.clearCache();
  }

  async clearCache(): Promise<void> {
    this.clearCacheEntry('econ-trader.getUserData');
  }
}

export const econTraderApi = new EconTraderApiClient({
  baseURL: import.meta.env.VITE_ECON_TRADER_API_URL ?? 'https://econ-trader-l3avc.api-bridge.work',
  cacheEnabled: true,
  cacheTTL: 60_000, // 1 minute
});
