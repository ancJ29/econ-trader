import { cStorageV3 } from '@/lib/connector/c-storage';
import type { EconomicCalendarFilters, EconomicEvent, EconomicIndex } from '@/types/calendar';
import { createBrowserLogger, dedupe } from '@an-oct/vani-kit';

const logger = createBrowserLogger('ECONOMIC-CALENDAR-SERVICE', {
  level: 'silent',
});

type CStorageEconomicCalendarEvent = {
  link: string;
  time: number;
  countryCode: string;
  countryName: string;
  uniqueCode: string;
  impact: 1 | 2 | 3;
  name: string;
  actual?: number | string;
  forecast?: number | string;
  previous?: number | string;
  unit: string;
};

type Language = 'en' | 'zh';
type Content = string;
type EconomicCalendar = {
  name: string;
  code: string;
  isPercentage?: boolean;
  description: Partial<Record<Language, Content>>;
  countryCode: string;
  currency: string;
  impact: 1 | 2 | 3;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  link: string;
  source: string;
};

// Service layer methods
export const economicCalendarService = {
  allCalendars: new Map<string, EconomicCalendar>(),

  async getallCalendars(): Promise<Map<string, EconomicCalendar>> {
    return dedupe.asyncDeduplicator.call('economic-calendar.getallCalendars', async () => {
      if (this.allCalendars.size === 0) {
        const serviceId = 'economic-calendars';
        const key = 'all-events';
        const data = await cStorageV3.get<EconomicCalendar[]>(serviceId, key);
        this.allCalendars = new Map(data?.map((event) => [event.link, event]) ?? []);
      }
      return this.allCalendars;
    });
  },

  async getEconomicCalendar(_filters?: EconomicCalendarFilters) {
    // TODO: Implement filters
    const allCalendars = await this.getallCalendars();
    logger.debug('allCalendars', allCalendars);
    const serviceId = 'economic-calendars';
    return await dedupe.asyncDeduplicator.call(
      'economic-calendar.getEconomicCalendar',
      async () => {
        const startOfMonth = getStartOfMonth(Date.now());
        const key = `monthly-events-${startOfMonth}`;
        logger.debug('getting monthly events', { serviceId, key });
        let data = (await cStorageV3.get<CStorageEconomicCalendarEvent[]>(serviceId, key)) ?? [];
        logger.debug('data', JSON.stringify(data, null, 2));
        data = data.filter((event) => event.link).filter((event) => allCalendars.has(event.link));
        const events =
          data?.map((event) => transformCStorageEventToEconomicEvent(event, allCalendars)) ?? [];
        return {
          events,
          pagination: {
            total: events.length,
            page: 1,
            pageSize: events.length,
            totalPages: 1,
          },
        };
      }
    );
  },

  async getEconomicIndex(eventCode: string): Promise<EconomicIndex> {
    const allCalendars = await this.getallCalendars();
    const calendar = Array.from(allCalendars.values()).find(
      (calendar) => calendar.code === eventCode
    );
    if (!calendar) {
      throw new Error(`Calendar not found for event code: ${eventCode}`);
    }
    return {
      code: calendar.code,
      name: calendar.name,
      detail: calendar.description.en ?? '',
      interval: calendar.interval,
      impact: calendar.impact,
      countryCode: calendar.countryCode,
      currencyCode: calendar.currency,
      source: calendar.source,
      url: calendar.link,
      isPercentage: calendar.isPercentage ?? false,
      historyData: [],
    } satisfies EconomicIndex;
  },
};

function transformCStorageEventToEconomicEvent(
  event: CStorageEconomicCalendarEvent,
  allCalendars: Map<string, EconomicCalendar>
): EconomicEvent {
  const CURRENCY_MAP: Record<string, string> = {
    US: 'USD',
    EU: 'EUR',
    JP: 'JPY',
    GB: 'GBP',
    CN: 'CNY',
  };

  const calendar = allCalendars.get(event.link);

  if (!calendar) {
    throw new Error(`Calendar not found for link: ${event.link}`);
  }

  return {
    ts: event.time,
    isPercentage: event.unit === '%',
    countryCode: event.countryCode,
    currencyCode: CURRENCY_MAP[event.countryCode],
    impact: event.impact,
    actual: event.actual ? Number(event.actual) : undefined,
    forecast: event.forecast ? Number(event.forecast) : undefined,
    previous: event.previous ? Number(event.previous) : undefined,
    uniqueCode: event.uniqueCode,
    name: event.name,
    period: generatePeriod(event.time, calendar.interval),
    eventCode: calendar.code,
    interval: calendar.interval,
    reference: calendar.link,
  };
}

/**
 * Calculates the start of month (midnight) for a given timestamp
 * Uses UTC to avoid timezone issues
 *
 * @param timestamp - Any timestamp within the target month
 * @returns Timestamp of the first millisecond of that month
 */
function getStartOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Generates the period for a given timestamp and interval
 *
 * @param ts - The timestamp
 * @param interval - The interval
 * @returns The period
 */
function generatePeriod(ts: number, interval: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
  const MONTH_NAMES = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const date = new Date(ts);

  switch (interval) {
    case 'weekly':
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    case 'monthly':
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    case 'yearly':
      return `${date.getFullYear()}`;
    default:
      return '';
  }
}
