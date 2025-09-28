import { create } from 'zustand';
import {
  economicCalendarService,
  type EconomicEvent,
  type EconomicCalendarFilters,
  type PaginationMetadata,
} from '@/services/economicCalendar';

interface EconomicCalendarState {
  events: EconomicEvent[];
  pagination: PaginationMetadata | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: EconomicCalendarFilters) => Promise<void>;
}

export const useEconomicCalendarStore = create<EconomicCalendarState>((set) => ({
  events: [],
  pagination: null,
  isLoading: false,
  error: null,
  fetchEvents: async (filters?: EconomicCalendarFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await economicCalendarService.getEconomicCalendar(filters);
      set({ events: response.events, pagination: response.pagination, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch economic calendar',
        isLoading: false,
      });
    }
  },
}));
