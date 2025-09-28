import { useEffect, useState } from 'react';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { Title, Stack, Alert, Text, Group, Paper, Pagination } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEconomicCalendarStore } from '@/store/economicCalendarStore';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { EventCard } from '@/components/economic-calendar/EventCard';
import { EventTable } from '@/components/economic-calendar/EventTable';
import { QuickFilters } from '@/components/economic-calendar/QuickFilters';
import { FilterControls } from '@/components/economic-calendar/FilterControls';
import type { EconomicCalendarFilters } from '@/services/economicCalendar';

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'US' },
  { value: 'EU', label: 'EU' },
  { value: 'JP', label: 'JP' },
  { value: 'GB', label: 'GB' },
  { value: 'CN', label: 'CN' },
] as const;

function EconomicCalendar() {
  const { t } = useTranslation();
  const { events, pagination, isLoading, error, fetchEvents } = useEconomicCalendarStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [eventNameFilter, setEventNameFilter] = useState('');
  const [impactFilter, setImpactFilter] = useState<string[]>([]);
  const [periodFromFilter, setPeriodFromFilter] = useState<Date | null>(null);
  const [periodToFilter, setPeriodToFilter] = useState<Date | null>(null);
  const [page, setPage] = useState(1);

  const [debouncedEventNameFilter] = useDebouncedValue(eventNameFilter, 500);

  useEffect(() => {
    const filters: EconomicCalendarFilters = {
      countryCodes: countryFilter.length > 0 ? countryFilter : undefined,
      eventName: debouncedEventNameFilter || undefined,
      impactLevels:
        impactFilter.length > 0 ? (impactFilter.map(Number) as (1 | 2 | 3)[]) : undefined,
      periodFrom: periodFromFilter?.getTime(),
      periodTo: periodToFilter?.getTime(),
      page,
      pageSize: 100,
    };

    fetchEvents(filters);
  }, [
    countryFilter,
    debouncedEventNameFilter,
    impactFilter,
    periodFromFilter,
    periodToFilter,
    page,
    fetchEvents,
  ]);

  const clearFilters = () => {
    setCountryFilter([]);
    setEventNameFilter('');
    setImpactFilter([]);
    setPeriodFromFilter(null);
    setPeriodToFilter(null);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getWeekRange = (offset: number): { start: Date; end: Date } => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + offset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
  };

  const getMonthRange = (offset: number): { start: Date; end: Date } => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return { start: startOfMonth, end: endOfMonth };
  };

  const applyQuickTimeFilter = (type: 'thisWeek' | 'nextWeek' | 'thisMonth' | 'nextMonth') => {
    let range: { start: Date; end: Date };

    switch (type) {
      case 'thisWeek':
        range = getWeekRange(0);
        break;
      case 'nextWeek':
        range = getWeekRange(1);
        break;
      case 'thisMonth':
        range = getMonthRange(0);
        break;
      case 'nextMonth':
        range = getMonthRange(1);
        break;
    }

    setPeriodFromFilter(range.start);
    setPeriodToFilter(range.end);
    setPage(1);
  };

  const applyQuickCountryFilter = (country: string) => {
    setCountryFilter([country]);
    setPage(1);
  };

  const getImpactColor = (impact: number): string => {
    if (impact === 3) return 'red';
    if (impact === 2) return 'yellow';
    return 'gray';
  };

  const getImpactLabel = (impact: number): string => {
    if (impact === 3) return t('impactHigh');
    if (impact === 2) return t('impactMedium');
    return t('impactLow');
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatValue = (value: number | undefined, isPercentage: boolean): string => {
    if (value === undefined) return '-';
    return isPercentage ? `${value}%` : value.toString();
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <Stack gap="lg" py="xl" w={
        isMobile ? '100%' : '80vw'
      }>
        <Title order={1}>{t('economicCalendar')}</Title>

        {error && (
          <Alert color="red" title={t('error')}>
            {error}
          </Alert>
        )}

        {!error && (
          <>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <QuickFilters
                  isMobile={isMobile}
                  onTimeFilterClick={applyQuickTimeFilter}
                  onCountryFilterClick={applyQuickCountryFilter}
                />

                <FilterControls
                  countryFilter={countryFilter}
                  onCountryFilterChange={setCountryFilter}
                  eventNameFilter={eventNameFilter}
                  onEventNameFilterChange={setEventNameFilter}
                  impactFilter={impactFilter}
                  onImpactFilterChange={setImpactFilter}
                  periodFromFilter={periodFromFilter}
                  onPeriodFromFilterChange={setPeriodFromFilter}
                  periodToFilter={periodToFilter}
                  onPeriodToFilterChange={setPeriodToFilter}
                  onClearFilters={clearFilters}
                  isMobile={isMobile}
                  countryOptions={COUNTRY_OPTIONS}
                />

                {pagination && (
                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">
                      {t('showingResults', { count: events.length, total: pagination.total })}
                    </Text>
                    <Pagination
                      total={pagination.totalPages}
                      value={page}
                      onChange={handlePageChange}
                      size="sm"
                    />
                  </Group>
                )}
              </Stack>
            </Paper>

            {isMobile ? (
              <Stack gap="md">
                {events.map((event) => (
                  <EventCard
                    key={event.ts}
                    event={event}
                    formatDate={formatDate}
                    getImpactColor={getImpactColor}
                    getImpactLabel={getImpactLabel}
                    formatValue={formatValue}
                  />
                ))}
              </Stack>
            ) : (
              <EventTable
                events={events}
                formatDate={formatDate}
                getImpactColor={getImpactColor}
                getImpactLabel={getImpactLabel}
                formatValue={formatValue}
              />
            )}

            {pagination && pagination.totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={pagination.totalPages}
                  value={page}
                  onChange={handlePageChange}
                />
              </Group>
            )}
          </>
        )}
      </Stack>
    </>
  );
}

export default EconomicCalendar;
