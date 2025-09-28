import { z } from 'zod';
import { BaseApiClient } from './base';
import { delay } from '@/utils/time';

export const EconomicEventSchema = z.object({
  ts: z.number(),
  isPercentage: z.boolean(),
  name: z.string(),
  countryCode: z.string(),
  currencyCode: z.string(),
  period: z.string(),
  eventCode: z.string(),
  interval: z.string(),
  impact: z.number().min(1).max(3),
  actual: z.number().optional(),
  forecast: z.number().optional(),
  previous: z.number().optional(),
  reference: z.string().url(),
});

export const EconomicIndexHistoryDataSchema = z.object({
  ts: z.number(),
  period: z.string(),
  actual: z.number().optional(),
  forecast: z.number().optional(),
  previous: z.number().optional(),
});

export const EconomicIndexSchema = z.object({
  code: z.string(),
  name: z.string(),
  detail: z.string(),
  interval: z.string(),
  impact: z.number().min(1).max(3),
  countryCode: z.string(),
  currencyCode: z.string(),
  source: z.string(),
  url: z.string().url(),
  isPercentage: z.boolean(),
  historyData: z.array(EconomicIndexHistoryDataSchema),
});

export const EconomicCalendarFiltersSchema = z.object({
  countryCodes: z.array(z.string()).optional(),
  eventName: z.string().optional(),
  impactLevels: z.array(z.number().min(1).max(3)).optional(),
  periodFrom: z.number().optional(), // Unix timestamp
  periodTo: z.number().optional(), // Unix timestamp
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(100),
});

export const PaginationMetadataSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const EconomicCalendarResponseSchema = z.object({
  events: z.array(EconomicEventSchema),
  pagination: PaginationMetadataSchema,
});

export type EconomicEvent = z.infer<typeof EconomicEventSchema>;
export type EconomicIndexHistoryData = z.infer<typeof EconomicIndexHistoryDataSchema>;
export type EconomicIndex = z.infer<typeof EconomicIndexSchema>;
export type EconomicCalendarFilters = z.infer<typeof EconomicCalendarFiltersSchema>;
export type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>;
export type EconomicCalendarResponse = z.infer<typeof EconomicCalendarResponseSchema>;

// Event templates for dummy data generation
const EVENT_TEMPLATES = [
  {
    name: 'GDP Growth Rate',
    interval: 'Quarterly',
    impactRange: [2, 3],
    source: 'Bureau of Economic Analysis',
    detail:
      'The GDP Growth Rate measures the annualized change in the inflation-adjusted value of all goods and services produced by the economy. It is one of the most comprehensive indicators of economic activity and health. A positive GDP growth rate indicates economic expansion, while a negative rate signals contraction. This metric is closely watched by policymakers, investors, and economists as it influences monetary policy decisions, investment strategies, and consumer confidence. Higher than expected growth can lead to currency appreciation and stock market gains.',
  },
  {
    name: 'Interest Rate Decision',
    interval: 'Monthly',
    impactRange: [3],
    source: 'Central Bank',
    detail:
      'The Interest Rate Decision represents the official interest rate at which banks can borrow money from the central bank, directly influencing borrowing costs throughout the economy. This policy tool is used to control inflation, stimulate economic growth, or cool down an overheating economy. Central banks raise rates to combat inflation by making borrowing more expensive, thereby reducing spending and investment. Conversely, they lower rates to encourage economic activity during slowdowns. Rate decisions have immediate and profound effects on currency valuations, bond yields, stock markets, and economic growth prospects.',
  },
  {
    name: 'Core CPI',
    interval: 'Monthly',
    impactRange: [2, 3],
    source: 'Bureau of Labor Statistics',
    detail:
      'The Core Consumer Price Index measures changes in the price level of consumer goods and services while excluding volatile food and energy prices. This exclusion provides a clearer picture of underlying inflation trends by removing short-term price fluctuations. Central banks closely monitor Core CPI when making monetary policy decisions, as it better reflects persistent inflationary pressures in the economy. Rising Core CPI may prompt interest rate hikes to prevent the economy from overheating, while declining figures could signal the need for monetary easing.',
  },
  {
    name: 'Inflation Rate',
    interval: 'Monthly',
    impactRange: [2, 3],
    source: 'Bureau of Labor Statistics',
    detail:
      'The Inflation Rate measures the percentage change in the general level of prices for goods and services over time, reflecting the rate at which purchasing power erodes. It encompasses a broad basket of consumer items including food, housing, transportation, and medical care. Central banks typically target an inflation rate of around 2% as optimal for economic stability. High inflation reduces purchasing power and can destabilize the economy, while deflation can lead to decreased spending and economic stagnation. This indicator directly influences central bank policy decisions and affects everything from wages to investment returns.',
  },
  {
    name: 'Unemployment Rate',
    interval: 'Monthly',
    impactRange: [3],
    source: 'Bureau of Labor Statistics',
    detail:
      'The Unemployment Rate represents the percentage of the total labor force that is jobless and actively seeking employment. It serves as a critical indicator of labor market health and overall economic well-being. A low unemployment rate typically indicates a strong economy with robust job creation, potentially leading to wage growth and increased consumer spending. Conversely, high unemployment signals economic weakness and can result in reduced consumer confidence and spending. Central banks monitor this metric closely when setting monetary policy, as persistently low unemployment can trigger inflationary pressures requiring interest rate adjustments.',
  },
  {
    name: 'Manufacturing PMI',
    interval: 'Monthly',
    impactRange: [2, 3],
    source: 'Institute for Supply Management',
    detail:
      "The Manufacturing Purchasing Managers' Index is a diffusion index calculated from surveys of purchasing managers across the manufacturing sector. It synthesizes data on new orders, production levels, employment, supplier deliveries, and inventories to gauge whether manufacturing conditions are expanding, contracting, or remaining stable. A PMI reading above 50 indicates expansion, while below 50 signals contraction. This forward-looking indicator provides early signals about economic trends as manufacturing activity often precedes broader economic changes. Investors and policymakers closely watch PMI data to anticipate shifts in economic momentum and potential impacts on employment, inflation, and GDP growth.",
  },
  {
    name: 'Services PMI',
    interval: 'Monthly',
    impactRange: [1, 2],
    source: 'Institute for Supply Management',
    detail:
      "The Services Purchasing Managers' Index measures the health of the services sector, which typically accounts for the largest portion of developed economies. Based on surveys of purchasing and supply executives, it tracks business activity, new orders, employment, and prices in industries such as finance, healthcare, retail, and hospitality. A reading above 50 indicates expansion while below 50 signals contraction. Since services dominate modern economies, this indicator provides crucial insights into economic trends, employment conditions, and inflationary pressures. Strong services PMI readings generally indicate robust consumer demand and economic growth.",
  },
  {
    name: 'Retail Sales',
    interval: 'Monthly',
    impactRange: [2],
    source: 'Census Bureau',
    detail:
      'Retail Sales measures the total receipts of retail stores and is one of the earliest indicators of consumer spending patterns, which drives approximately 70% of economic activity in developed nations. This data encompasses purchases at stores selling durable and non-durable goods, reflecting consumer confidence and disposable income levels. Strong retail sales growth indicates healthy consumer demand and economic expansion, while declining sales may signal economic weakness or reduced consumer confidence. Seasonal variations, especially during holiday periods, can significantly impact monthly figures. Economists and investors monitor retail sales trends to gauge economic momentum and predict GDP growth.',
  },
  {
    name: 'Trade Balance',
    interval: 'Monthly',
    impactRange: [1, 2],
    source: 'Census Bureau',
    detail:
      "The Trade Balance represents the difference between the monetary value of a country's exports and imports of goods and services over a specific period. A trade surplus occurs when exports exceed imports, indicating strong international demand for domestic products and potentially strengthening the currency. Conversely, a trade deficit means imports surpass exports, which can weaken the currency but may also reflect strong domestic demand and economic growth. The trade balance affects currency valuations, GDP calculations, and can influence monetary policy decisions. Persistent trade imbalances may lead to political tensions and policy interventions.",
  },
  {
    name: 'Consumer Confidence',
    interval: 'Monthly',
    impactRange: [2],
    source: 'Conference Board',
    detail:
      "Consumer Confidence measures the degree of optimism consumers express about the overall state of the economy and their personal financial situations through surveys. This forward-looking indicator reflects consumers' willingness to spend, which is crucial since consumer spending accounts for the majority of economic activity. High consumer confidence typically correlates with increased spending on discretionary items, while low confidence often leads to increased savings and reduced expenditures. The index incorporates views on current economic conditions and expectations for the next six months, providing insights into future consumption patterns and potential economic trends.",
  },
  {
    name: 'Industrial Production',
    interval: 'Monthly',
    impactRange: [1, 2],
    source: 'Federal Reserve',
    detail:
      "Industrial Production measures the physical output of the nation's factories, mines, and utilities, capturing the real output of the industrial sector adjusted for price changes. This indicator reflects the productive capacity utilization of the economy and serves as a gauge of economic strength in the manufacturing and production sectors. Rising industrial production typically indicates economic expansion, increased demand for goods, and potential job creation, while declining production may signal economic weakness or reduced demand. The metric also helps assess inflationary pressures, as operating near full capacity can lead to price increases. Policymakers and investors monitor this data to evaluate economic momentum.",
  },
  {
    name: 'Housing Starts',
    interval: 'Monthly',
    impactRange: [1],
    source: 'Census Bureau',
    detail:
      'Housing Starts measures the number of new residential construction projects that have begun during a particular month, serving as a leading indicator of economic activity in the construction and real estate sectors. This metric reflects builder confidence in future economic conditions and consumer demand for housing. Increased housing starts generate significant economic ripple effects through job creation in construction, demand for building materials, and purchases of appliances and furnishings. The indicator also provides insights into consumer confidence, mortgage market conditions, and overall economic health. Strong housing start numbers typically signal economic optimism and expansion.',
  },
  {
    name: 'Building Permits',
    interval: 'Monthly',
    impactRange: [1],
    source: 'Census Bureau',
    detail:
      'Building Permits tracks the number of permits issued for new residential construction projects and serves as a forward-looking indicator of future construction activity. Since permits must be obtained before construction begins, this data provides early signals about upcoming housing starts and builder confidence in market conditions. A rising trend in permits suggests optimism about housing demand, economic growth, and credit availability. Conversely, declining permits may indicate concerns about future market conditions or economic headwinds. This indicator helps forecast construction employment trends, materials demand, and broader economic activity several months ahead.',
  },
  {
    name: 'Existing Home Sales',
    interval: 'Monthly',
    impactRange: [1, 2],
    source: 'National Association of Realtors',
    detail:
      'Existing Home Sales measures the number of previously owned homes that changed hands during the month, reflecting current activity in the resale housing market which constitutes the bulk of total home sales. This indicator provides insights into housing market health, consumer confidence, and wealth effects, as existing home sales generate significant economic activity through real estate commissions, home improvements, and purchases of furniture and appliances. Strong sales typically indicate buyer confidence in economic conditions and job security, while weak sales may reflect affordability concerns, high mortgage rates, or economic uncertainty. The data also influences monetary policy decisions and economic growth projections.',
  },
  {
    name: 'New Home Sales',
    interval: 'Monthly',
    impactRange: [1],
    source: 'Census Bureau',
    detail:
      'New Home Sales measures the number of newly constructed homes sold during the month, providing a timely indicator of demand for new housing and builder confidence in market conditions. This metric is more sensitive to economic changes than existing home sales because it reflects current market dynamics and builder expectations. Strong new home sales signal robust consumer demand, economic optimism, and typically lead to increased construction activity, job creation, and purchases of building materials and home furnishings. The indicator also reflects credit market conditions, as new home purchases require mortgage financing. Trends in new home sales help forecast future construction activity and broader economic momentum.',
  },
];

const COUNTRIES = ['US', 'EU', 'JP', 'GB', 'CN'];

const CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  EU: 'EUR',
  JP: 'JPY',
  GB: 'GBP',
  CN: 'CNY',
};

function generateDummyEvents(): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-09-28');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Generate approximately 15-16 events per day to reach ~10k events
  const eventsPerDay = 16;

  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    // Generate events for this day
    for (let i = 0; i < eventsPerDay; i++) {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const impact = template.impactRange[
        Math.floor(Math.random() * template.impactRange.length)
      ] as 1 | 2 | 3;

      const eventCode = (country + '-' + template.name).toLowerCase().replace(/\s+/g, '-');
      const currencyCode = CURRENCY_MAP[country];

      // Add some time variation to the day (spread events across the day)
      const timestamp = currentDate.getTime() + i * 3600000; // Add hours

      // Determine period based on interval
      let period: string;
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      if (template.interval === 'Quarterly') {
        const quarter = Math.floor(month / 3) + 1;
        period = `Q${quarter}, ${year}`;
      } else {
        const monthNames = [
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
        period = `${monthNames[month]}, ${year}`;
      }

      // Generate realistic values
      const isPercentage = Math.random() > 0.3; // 70% are percentages
      const baseValue = isPercentage ? Math.random() * 10 : Math.random() * 1000;
      const variance = baseValue * 0.1;

      const previous = Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10;
      const forecast = Math.round((previous + (Math.random() - 0.5) * variance * 0.5) * 10) / 10;
      const actual =
        Math.random() > 0.3
          ? Math.round((forecast + (Math.random() - 0.5) * variance * 0.3) * 10) / 10
          : undefined;

      events.push({
        ts: timestamp,
        isPercentage,
        name: template.name,
        eventCode,
        countryCode: country,
        currencyCode,
        period,
        interval: template.interval,
        impact,
        actual,
        forecast,
        previous,
        reference: `https://www.investing.com/economic-calendar/${template.name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`,
      });
    }
  }

  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => b.ts - a.ts);
}

// Cache the generated events (in production, this would come from the backend)
let cachedEvents: EconomicEvent[] | null = null;

function getAllEvents(): EconomicEvent[] {
  if (!cachedEvents) {
    cachedEvents = generateDummyEvents();
  }
  return cachedEvents;
}

function applyFilters(
  events: EconomicEvent[],
  filters?: Omit<EconomicCalendarFilters, 'page' | 'pageSize'>
): EconomicEvent[] {
  if (!filters) return events;

  return events.filter((event) => {
    // Filter by country codes
    if (filters.countryCodes && filters.countryCodes.length > 0) {
      if (!filters.countryCodes.includes(event.countryCode)) {
        return false;
      }
    }

    // Filter by event name (case-insensitive substring match)
    if (filters.eventName) {
      if (!event.name.toLowerCase().includes(filters.eventName.toLowerCase())) {
        return false;
      }
    }

    // Filter by impact levels
    if (filters.impactLevels && filters.impactLevels.length > 0) {
      if (!filters.impactLevels.includes(event.impact)) {
        return false;
      }
    }

    // Filter by date range (from)
    if (filters.periodFrom !== undefined && event.ts < filters.periodFrom) {
      return false;
    }

    // Filter by date range (to)
    if (filters.periodTo !== undefined && event.ts > filters.periodTo) {
      return false;
    }

    return true;
  });
}

function applyPagination(
  events: EconomicEvent[],
  page: number,
  pageSize: number
): { events: EconomicEvent[]; pagination: PaginationMetadata } {
  const total = events.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    events: events.slice(startIndex, endIndex),
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

class EconomicCalendarApiClient extends BaseApiClient {
  async getEconomicCalendar(filters?: EconomicCalendarFilters): Promise<EconomicCalendarResponse> {
    await delay(300);
    // Validate and apply defaults
    const validatedFilters = EconomicCalendarFiltersSchema.parse(filters || {});

    // In production, this would call:
    // return this.get('/economic-calendar', validatedFilters, EconomicCalendarResponseSchema);

    // For now, get all events, apply filters, then paginate
    const allEvents = getAllEvents();
    const filteredEvents = applyFilters(allEvents, validatedFilters);
    const paginatedResult = applyPagination(
      filteredEvents,
      validatedFilters.page,
      validatedFilters.pageSize
    );

    return EconomicCalendarResponseSchema.parse(paginatedResult);
  }

  async getEconomicIndex(eventCode: string): Promise<EconomicIndex> {
    await delay(300);

    // In production, this would call:
    // return this.get(`/economic-index/${eventCode}`, {}, EconomicIndexSchema);

    // For now, build index from events
    const allEvents = getAllEvents();
    const indexEvents = allEvents.filter((event) => event.eventCode === eventCode);

    if (indexEvents.length === 0) {
      throw new Error(`Economic index with code "${eventCode}" not found`);
    }

    // Use the first event to get metadata
    const firstEvent = indexEvents[0];
    const template = EVENT_TEMPLATES.find((t) => t.name === firstEvent.name);

    if (!template) {
      throw new Error(`Template for "${firstEvent.name}" not found`);
    }

    // Build history data from all events (sorted by timestamp descending)
    const historyData: EconomicIndexHistoryData[] = indexEvents.map((event) => ({
      ts: event.ts,
      period: event.period,
      actual: event.actual,
      forecast: event.forecast,
      previous: event.previous,
    }));

    const index: EconomicIndex = {
      code: eventCode,
      name: firstEvent.name,
      detail: template.detail,
      interval: firstEvent.interval,
      impact: firstEvent.impact,
      countryCode: firstEvent.countryCode,
      currencyCode: firstEvent.currencyCode,
      source: template.source,
      url: firstEvent.reference,
      isPercentage: firstEvent.isPercentage,
      historyData,
    };

    return EconomicIndexSchema.parse(index);
  }
}

export const economicCalendarApi = new EconomicCalendarApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
