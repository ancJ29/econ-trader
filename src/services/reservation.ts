import { econTraderApi, type Reservation as ApiReservation } from '@/lib/api/econ-trader';
import { OrderSide, TradingMarket } from '@/types/account';
import { dedupe } from '@an-oct/vani-kit';
import { transformBackendMarket, transformMarket } from './_helpers';

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
  symbol: string;
  side: OrderSide;
  volume: number;
  orderType: 'LIMIT' | 'MARKET';
  enabled: boolean;
  createdAt: number;
  specificValue?: number | undefined;
  limitPrice?: number | undefined;
};

export type CreateReservationInput = {
  symbol: string;
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
  symbol?: string | undefined;
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
    symbol: reservation.symbol,
    side: reservation.side,
    volume: reservation.volume,
    orderType: reservation.orderType,
    enabled: reservation.enabled,
    createdAt: reservation.createdAt,
    specificValue: reservation.specificValue,
    limitPrice: reservation.limitPrice,
  };
}

type UniqueCode = string;

// Service layer methods
export const reservationService = {
  reservations: new Map<UniqueCode, Reservation[]>(),

  // Check if there are any reservations for a given unique code
  async hasReservations(uniqueCode?: string): Promise<boolean> {
    const userData = await econTraderApi.getUserData();
    if (uniqueCode) {
      const reservationIds = userData.reservationIdsByUniqueCode?.[uniqueCode] ?? [];
      return reservationIds.length > 0;
    }
    const uniqueCodes = Object.keys(userData.reservationIdsByUniqueCode ?? {});
    return uniqueCodes.length > 0;
  },

  // Get all reservations
  async getReservations(): Promise<Reservation[]> {
    const reservations = await dedupe.asyncDeduplicator.call(
      'reservation.getReservations',
      async () => {
        const hasReservations = await this.hasReservations();
        if (!hasReservations) {
          return [];
        }
        return econTraderApi
          .getAllReservations()
          .then((reservations) => reservations.map(transformReservation));
      }
    );

    // Cache the reservations by unique code
    const groupedReservations = reservations.reduce(
      (acc, reservation) => {
        acc[reservation.uniqueCode] = [...(acc[reservation.uniqueCode] ?? []), reservation];
        return acc;
      },
      {} as Record<UniqueCode, Reservation[]>
    );
    this.reservations = new Map(Object.entries(groupedReservations));

    return reservations;
  },

  // Get reservations by unique code
  async getReservationsByUniqueCode(uniqueCode: string): Promise<Reservation[]> {
    if (this.reservations.has(uniqueCode)) {
      return this.reservations.get(uniqueCode) ?? [];
    }

    // If no reservations are cached, fetch them from the API
    const reservations = await dedupe.asyncDeduplicator.call(
      'reservation.getReservations',
      async () => {
        const hasReservations = await this.hasReservations(uniqueCode);
        if (!hasReservations) {
          return [];
        }
        const reservations = await econTraderApi.getReservationIdsByUniqueCode(uniqueCode);
        return reservations.map(transformReservation);
      }
    );

    return reservations;
  },

  // Create a reservation
  async createReservation(input: CreateReservationInput): Promise<void> {
    await econTraderApi.createReservation({
      uniqueCode: input.uniqueCode,
      eventCode: input.eventCode,
      eventName: input.eventName,
      accountId: input.accountId,
      market: transformBackendMarket(input.market) as 'Coin-M' | 'USDS-M',
      triggerType: input.triggerType,
      condition: input.condition,
      symbol: input.symbol,
      side: input.side,
      volume: input.volume,
      orderType: input.orderType,
      enabled: input.enabled,
      specificValue: input.specificValue,
      limitPrice: input.limitPrice,
    });
    this.clearCache(input.uniqueCode);
  },

  // Update a reservation
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
      symbol: input.symbol ? (input.symbol ?? '') : undefined,
      side: input.side,
      volume: input.volume,
      orderType: input.orderType,
      enabled: input.enabled,
      specificValue: input.specificValue,
      limitPrice: input.limitPrice,
    });
    this.clearCache(input.uniqueCode);

    // Fetch and return the updated reservation
    const reservations = await this.getReservationsByUniqueCode(input.uniqueCode);
    const updated = reservations.find((r) => r.id === input.id);
    if (!updated) {
      throw new Error('Reservation not found after update');
    }
    return updated;
  },

  // Delete a reservation
  async deleteReservation(uniqueCode: string, id: string): Promise<void> {
    await econTraderApi.deleteReservation({ uniqueCode, id });
    this.clearCache(uniqueCode);
  },

  // Clear the cache
  clearCache(uniqueCode?: string) {
    if (uniqueCode) {
      this.reservations.delete(uniqueCode);
    } else {
      this.reservations.clear();
    }
  },
};
