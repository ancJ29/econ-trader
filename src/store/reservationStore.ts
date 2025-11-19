import {
  reservationService,
  type CreateReservationInput,
  type Reservation,
  type UpdateReservationInput,
} from '@/services/reservation';
import { createBrowserLogger } from '@an-oct/vani-kit';
import { create } from 'zustand';

const logger = createBrowserLogger('RESERVATION-STORE', {
  level: 'debug',
});

type ReservationState = {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  fetchReservations: (uniqueCode: string) => Promise<void>;
  createReservation: (input: CreateReservationInput) => Promise<void>;
  updateReservation: (input: UpdateReservationInput) => Promise<void>;
  deleteReservation: (uniqueCode: string, id: string) => Promise<void>;
  toggleEnabled: (uniqueCode: string, id: string) => Promise<void>;
};

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  isLoading: false,
  error: null,

  fetchReservations: async (uniqueCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const reservations = await reservationService.getReservations(uniqueCode);
      set({ reservations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch reservations',
        isLoading: false,
      });
    }
  },

  createReservation: async (input: CreateReservationInput) => {
    logger.debug('Creating reservation...', input);
    if (!input.uniqueCode) {
      logger.error('Unique code is required to create a reservation');
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await reservationService.createReservation(input);
      await get().fetchReservations(input.uniqueCode);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create reservation',
        isLoading: false,
      });
      throw error;
    }
  },

  updateReservation: async (input: UpdateReservationInput) => {
    logger.debug('Updating reservation...', input);
    set({ isLoading: true, error: null });
    try {
      const updated = await reservationService.updateReservation(input);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === updated.id ? updated : r)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update reservation',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteReservation: async (uniqueCode: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      await reservationService.deleteReservation(uniqueCode, id);
      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete reservation',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleEnabled: async (uniqueCode: string, id: string) => {
    const reservation = get().reservations.find((r) => r.id === id);
    if (!reservation) return;

    await get().updateReservation({
      id,
      uniqueCode,
      enabled: !reservation.enabled,
    });
  },
}));
