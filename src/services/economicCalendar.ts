import { cStorageV3 } from '@/lib/connector/c-storage';
import type { EconomicCalendarFilters, EconomicEvent, EconomicIndex } from '@/types/calendar';
import { createBrowserLogger, dedupe, ONE_DAY } from '@an-oct/vani-kit';

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
  source: {
    name: string;
    url: string;
  };
};

// Service layer methods
export const economicCalendarService = {
  allCalendars: new Map<string, EconomicCalendar>(),

  async getAllCalendars(): Promise<Map<string, EconomicCalendar>> {
    return dedupe.asyncDeduplicator.call('economic-calendar.getAllCalendars', async () => {
      if (this.allCalendars.size === 0) {
        const serviceId = 'economic-calendars';
        const key = 'all-economic-calendar-events';
        const data = await cStorageV3.get<EconomicCalendar[]>(serviceId, key);
        this.allCalendars = new Map(data?.map((event) => [event.code, event]) ?? []);
      }
      return this.allCalendars;
    });
  },

  async getEconomicCalendar(_filters?: EconomicCalendarFilters) {
    logger.debug('getEconomicCalendar', JSON.stringify(_filters, null, 2));
    // TODO: Implement filters
    const allCalendars = await this.getAllCalendars();
    const serviceId = 'economic-calendars';

    async function _getData() {
      function _start(time: number) {
        const date = new Date(time);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(1);
        return date.getTime();
      }
      const time = Date.now();
      const startOfMonth = _start(time);
      const keys = [
        `monthly-events-${_start(startOfMonth - 101 * ONE_DAY)}`, // 4 months ago
        `monthly-events-${_start(startOfMonth - 71 * ONE_DAY)}`, // 3 months ago
        `monthly-events-${_start(startOfMonth - 41 * ONE_DAY)}`, // 2 months ago
        `monthly-events-${_start(startOfMonth - 10 * ONE_DAY)}`, // Last month
        `monthly-events-${startOfMonth}`, // This month
        `monthly-events-${_start(startOfMonth + 32 * ONE_DAY)}`, // Next month
      ];
      const data =
        (await cStorageV3.getMany<
          {
            data: CStorageEconomicCalendarEvent[];
          }[]
        >(serviceId, keys)) ?? [];
      return data
        .map((item) => item.data)
        .flat()
        .filter((el) => el.link)
        .map((el) => ({
          ...el,
          code: el.link.replace('/economic-calendar/', ''),
        }));
    }

    return await dedupe.asyncDeduplicator.call(
      'economic-calendar.getEconomicCalendar',
      async () => {
        const rawData = await _getData();
        const data = rawData.flat().filter((event) => allCalendars.has(event.code));
        console.log('allCalendars', JSON.stringify(Array.from(allCalendars.values()), null, 2));
        console.log('data', JSON.stringify(rawData, null, 2));
        const events =
          data?.map((event) => transformCStorageEventToEconomicEvent(event, allCalendars)) ?? [];
        events.sort((a, b) => b.ts - a.ts);
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
    const allCalendars = await this.getAllCalendars();
    const code = eventCode.replace('/economic-calendar/', '');
    const calendar = Array.from(allCalendars.values()).find((calendar) => calendar.code === code);
    if (!calendar) {
      throw new Error(`Calendar not found for event code: ${code}`);
    }
    return {
      code: calendar.code,
      name: calendar.name,
      detail: calendar.description.en ?? '',
      interval: calendar.interval,
      impact: calendar.impact,
      countryCode: calendar.countryCode,
      currencyCode: calendar.currency,
      source: calendar.source.name,
      sourceUrl: calendar.source.url,
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

  const code = event.link.replace('/economic-calendar/', '');
  const calendar = allCalendars.get(code);

  if (!calendar) {
    throw new Error(`Calendar not found for link: ${code}`);
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
