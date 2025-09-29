import {
  reservationApi,
  type Reservation as ApiReservation,
  type CreateReservationInput as ApiCreateReservationInput,
  type UpdateReservationInput as ApiUpdateReservationInput,
  type ReservationsResponse as ApiReservationsResponse,
} from '@/lib/api/reservation';

// Re-export types from API layer
export type Reservation = ApiReservation & {
  // TODO: add isPastReservation
};
export type CreateReservationInput = ApiCreateReservationInput;
export type UpdateReservationInput = ApiUpdateReservationInput;
export type ReservationsResponse = ApiReservationsResponse;

// Service layer methods
export const reservationService = {
  async getReservations(eventCode?: string): Promise<ReservationsResponse> {
    return reservationApi.getReservations(eventCode);
  },

  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    return reservationApi.createReservation(input);
  },

  async updateReservation(input: UpdateReservationInput): Promise<Reservation> {
    return reservationApi.updateReservation(input);
  },

  async deleteReservation(id: string): Promise<void> {
    return reservationApi.deleteReservation(id);
  },
};
