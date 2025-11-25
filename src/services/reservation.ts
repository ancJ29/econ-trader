import { econTraderApi, type Reservation as ApiReservation } from '@/lib/api/econ-trader';
import { OrderSide, TradingMarket, TradingSymbol } from '@/types/account';
import { dedupe } from '@an-oct/vani-kit';
import {
  transformBackendMarket,
  transformBackendSymbol,
  transformMarket,
  transformSymbol,
} from './helpers';

// Re-export types from API layer
export type Reservation = {
  id: string;
  uniqueCode: string;
  eventCode: string;
  eventName: string;
  accountId: string;
  market: TradingMarket;
  triggerType: 'actual_vs_forecast' | 'actual_vs_previous' | 'actual_vs_specific';
  condition: 'greater' | 'less';
  symbol: TradingSymbol;
  side: OrderSide;
  volume: number;
  orderType: 'LIMIT' | 'MARKET';
  enabled: boolean;
  createdAt: number;
  specificValue?: number | undefined;
  limitPrice?: number | undefined;
};

export type CreateReservationInput = {
  symbol: TradingSymbol;
  market: TradingMarket;
  uniqueCode: string;
  eventCode: string;
  eventName: string;
  accountId: string;
  triggerType: 'actual_vs_forecast' | 'actual_vs_previous' | 'actual_vs_specific';
  condition: 'greater' | 'less';
  side: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'MARKET';
  enabled: boolean;
  volume: number;
  specificValue?: number | undefined;
  limitPrice?: number | undefined;
};

export type UpdateReservationInput = {
  id: string;
  uniqueCode: string;
  eventCode?: string | undefined;
  eventName?: string | undefined;
  accountId?: string | undefined;
  market?: TradingMarket | undefined;
  triggerType?: 'actual_vs_forecast' | 'actual_vs_previous' | 'actual_vs_specific' | undefined;
  condition?: 'greater' | 'less' | undefined;
  specificValue?: number | undefined;
  symbol?: TradingSymbol | undefined;
  side?: 'BUY' | 'SELL' | undefined;
  volume?: number | undefined;
  orderType?: 'LIMIT' | 'MARKET' | undefined;
  limitPrice?: number | undefined;
  enabled?: boolean | undefined;
  createdAt?: number | undefined;
};

function transformReservation(reservation: ApiReservation): Reservation {
  return {
    id: reservation.id,
    uniqueCode: reservation.uniqueCode,
    eventCode: reservation.eventCode,
    eventName: reservation.eventName,
    accountId: reservation.accountId,
    market: transformMarket(reservation.market),
    triggerType: reservation.triggerType,
    condition: reservation.condition,
    symbol: transformSymbol(reservation.symbol),
    side: reservation.side,
    volume: reservation.volume,
    orderType: reservation.orderType,
    enabled: reservation.enabled,
    createdAt: reservation.createdAt,
    specificValue: reservation.specificValue,
    limitPrice: reservation.limitPrice,
  };
}

// Service layer methods
export const reservationService = {
  // uniqueCode -> reservations
  reservations: new Map<string, Reservation[]>(),

  async getReservations(uniqueCode: string): Promise<Reservation[]> {
    if (this.reservations.has(uniqueCode)) {
      return this.reservations.get(uniqueCode) ?? [];
    }

    // If no reservations are cached, fetch them from the API
    if (this.reservations.size === 0) {
      const response = await dedupe.asyncDeduplicator.call(
        'reservation.getReservations',
        async () => {
          return econTraderApi.getUserData();
        }
      );
      this.reservations = new Map(
        Object.entries(response.reservations ?? {}).map(([uniqueCode, reservations]) => {
          return [uniqueCode, reservations.map(transformReservation)];
        })
      );

      if (this.reservations.size === 0) {
        // make a default reservation
        this.reservations.set(uniqueCode, []);
      }
    }
    return this.reservations.get(uniqueCode) ?? [];
  },

  async createReservation(input: CreateReservationInput): Promise<void> {
    await econTraderApi.createReservation({
      uniqueCode: input.uniqueCode,
      eventCode: input.eventCode,
      eventName: input.eventName,
      accountId: input.accountId,
      market: transformBackendMarket(input.market) as 'Coin-M' | 'USDS-M',
      triggerType: input.triggerType,
      condition: input.condition,
      symbol: transformBackendSymbol(input.symbol),
      side: input.side,
      volume: input.volume,
      orderType: input.orderType,
      enabled: input.enabled,
      specificValue: input.specificValue,
      limitPrice: input.limitPrice,
    });
    this.clearCache();
  },

  async updateReservation(input: UpdateReservationInput): Promise<Reservation> {
    await econTraderApi.updateReservation({
      id: input.id,
      uniqueCode: input.uniqueCode,
      eventCode: input.eventCode,
      eventName: input.eventName,
      accountId: input.accountId,
      market: input.market
        ? (transformBackendMarket(input.market) as 'Coin-M' | 'USDS-M')
        : undefined,
      triggerType: input.triggerType,
      condition: input.condition,
      symbol: input.symbol ? transformBackendSymbol(input.symbol ?? '') : undefined,
      side: input.side,
      volume: input.volume,
      orderType: input.orderType,
      enabled: input.enabled,
      specificValue: input.specificValue,
      limitPrice: input.limitPrice,
    });
    this.clearCache();

    // Fetch and return the updated reservation
    const reservations = await this.getReservations(input.uniqueCode);
    const updated = reservations.find((r) => r.id === input.id);
    if (!updated) {
      throw new Error('Reservation not found after update');
    }
    return updated;
  },

  async deleteReservation(uniqueCode: string, id: string): Promise<void> {
    await econTraderApi.deleteReservation({ uniqueCode, id });
    this.clearCache();
  },

  clearCache() {
    this.reservations.clear();
  },
};
