import { create } from 'zustand';
import {
  reservationService,
  type Reservation,
  type CreateReservationInput,
  type UpdateReservationInput,
} from '@/services/reservation';

interface ReservationState {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  fetchReservations: (eventCode?: string) => Promise<void>;
  createReservation: (input: CreateReservationInput) => Promise<void>;
  updateReservation: (input: UpdateReservationInput) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  toggleEnabled: (id: string) => Promise<void>;
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  isLoading: false,
  error: null,

  fetchReservations: async (eventCode?: string) => {
    set({ isLoading: true, error: null });
    try {
      const reservations = await reservationService.getReservations(eventCode);
      set({ reservations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch reservations',
        isLoading: false,
      });
    }
  },

  createReservation: async (input: CreateReservationInput) => {
    set({ isLoading: true, error: null });
    try {
      const newReservation = await reservationService.createReservation(input);
      set((state) => ({
        reservations: [...state.reservations, newReservation],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create reservation',
        isLoading: false,
      });
      throw error;
    }
  },

  updateReservation: async (input: UpdateReservationInput) => {
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

  deleteReservation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await reservationService.deleteReservation(id);
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

  toggleEnabled: async (id: string) => {
    const reservation = get().reservations.find((r) => r.id === id);
    if (!reservation) return;

    await get().updateReservation({ id, enabled: !reservation.enabled });
  },
}));
