import {
  economicCalendarApi,
  type EconomicEvent as ApiEconomicEvent,
  type EconomicIndex as ApiEconomicIndex,
  type EconomicIndexHistoryData as ApiEconomicIndexHistoryData,
  type EconomicCalendarResponse as ApiEconomicCalendarResponse,
  type EconomicCalendarFilters as ApiEconomicCalendarFilters,
  type PaginationMetadata as ApiPaginationMetadata,
} from '@/lib/api/economicCalendar';

// Re-export types from API layer
// This allows frontend code to use stable types while API contract can change
export type EconomicEvent = ApiEconomicEvent;
export type EconomicIndex = ApiEconomicIndex;
export type EconomicIndexHistoryData = ApiEconomicIndexHistoryData;
export type EconomicCalendarResponse = ApiEconomicCalendarResponse;
export type EconomicCalendarFilters = ApiEconomicCalendarFilters;
export type PaginationMetadata = ApiPaginationMetadata;

// Service layer methods
export const economicCalendarService = {
  async getEconomicCalendar(filters?: EconomicCalendarFilters): Promise<EconomicCalendarResponse> {
    const response = await economicCalendarApi.getEconomicCalendar(filters);
    // Future: Transform API response to frontend-optimized format here if needed
    return response;
  },

  async getEconomicIndex(eventCode: string): Promise<EconomicIndex> {
    const response = await economicCalendarApi.getEconomicIndex(eventCode);
    // Future: Transform API response here if needed
    return response;
  },
};
