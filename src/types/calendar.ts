export type EconomicEvent = {
  uniqueCode: string;
  ts: number;
  isPercentage: boolean;
  name: string;
  countryCode: string;
  currencyCode: string;
  period: string;
  eventCode: string;
  interval: string;
  impact: number;
  actual?: number;
  forecast?: number;
  previous?: number;
  reference: string;
};

export type EconomicIndex = {
  code: string;
  name: string;
  detail: string;
  interval: string;
  impact: number;
  countryCode: string;
  currencyCode: string;
  source: string;
  url: string;
  isPercentage: boolean;
  historyData: {
    ts: number;
    period: string;
    actual?: number | undefined;
    forecast?: number | undefined;
    previous?: number | undefined;
  }[];
};

export type EconomicIndexHistoryData = {
  ts: number;
  period: string;
  actual?: number | undefined;
  forecast?: number | undefined;
  previous?: number | undefined;
};

export type EconomicCalendarFilters = {
  page: number;
  pageSize: number;
  countryCodes?: string[] | undefined;
  eventName?: string | undefined;
  impactLevels?: number[] | undefined;
  periodFrom?: number | undefined;
  periodTo?: number | undefined;
};

export type PaginationMetadata = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
