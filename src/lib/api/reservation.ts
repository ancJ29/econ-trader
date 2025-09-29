import { z } from 'zod';
import { BaseApiClient } from './base';
import { delay } from '@/utils/time';
import type { TradingMarket, TradingSymbol } from '@/types/account';

export const ReservationSchema = z.object({
  id: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
  accountId: z.string(),
  market: z.string() as z.ZodType<TradingMarket>,
  triggerType: z.enum(['actual_vs_forecast', 'actual_vs_previous']),
  condition: z.enum(['greater', 'less']),
  instrument: z.string() as z.ZodType<TradingSymbol>,
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  orderType: z.enum(['market', 'limit']),
  limitPrice: z.number().positive().optional(),
  enabled: z.boolean(),
  createdAt: z.number(),
});

export const CreateReservationSchema = ReservationSchema.omit({ id: true, createdAt: true });
export const UpdateReservationSchema = ReservationSchema.partial().required({ id: true });
export const ReservationsResponseSchema = z.array(ReservationSchema);

export type Reservation = z.infer<typeof ReservationSchema>;
export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type UpdateReservationInput = z.infer<typeof UpdateReservationSchema>;
export type ReservationsResponse = z.infer<typeof ReservationsResponseSchema>;

// In-memory storage for dummy data (production would use backend)
const reservationsStore: Reservation[] = [];
let nextId = 1;

class ReservationApiClient extends BaseApiClient {
  async getReservations(eventCode?: string): Promise<ReservationsResponse> {
    await delay(200);

    // In production: return this.get('/reservations', { eventCode }, ReservationsResponseSchema);

    // Filter by eventCode if provided
    const filtered = eventCode
      ? reservationsStore.filter((reservation) => reservation.eventCode === eventCode)
      : reservationsStore;

    return ReservationsResponseSchema.parse(filtered);
  }

  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    await delay(200);

    // In production: return this.post('/reservations', input, ReservationSchema);

    const reservation: Reservation = {
      ...input,
      id: `reservation-${nextId++}`,
      createdAt: Date.now(),
    };

    reservationsStore.push(reservation);
    return ReservationSchema.parse(reservation);
  }

  async updateReservation(input: UpdateReservationInput): Promise<Reservation> {
    await delay(200);

    // In production: return this.put(`/reservations/${input.id}`, input, ReservationSchema);

    const index = reservationsStore.findIndex((r) => r.id === input.id);
    if (index === -1) {
      throw new Error(`Reservation with id "${input.id}" not found`);
    }

    const updated = { ...reservationsStore[index], ...input };
    reservationsStore[index] = updated;

    return ReservationSchema.parse(updated);
  }

  async deleteReservation(id: string): Promise<void> {
    await delay(200);

    // In production: return this.delete(`/reservations/${id}`);

    const index = reservationsStore.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Reservation with id "${id}" not found`);
    }

    reservationsStore.splice(index, 1);
  }
}

export const reservationApi = new ReservationApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
