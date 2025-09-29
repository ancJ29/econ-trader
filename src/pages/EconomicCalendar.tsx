import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Title, Stack, Alert, Text, Group, Paper, Pagination } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEconomicCalendarStore } from '@/store/economicCalendarStore';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { EventCard } from '@/components/economic-calendar/EventCard';
import { EventTable } from '@/components/economic-calendar/EventTable';
import { QuickFilters } from '@/components/economic-calendar/QuickFilters';
import { FilterControls } from '@/components/economic-calendar/FilterControls';
import { ReservationDrawer } from '@/components/economic-calendar/ReservationDrawer';
import type { EconomicCalendarFilters, EconomicEvent } from '@/services/economicCalendar';

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
  const isMobile = useIsMobile();

  // Pending filters (user selections, not yet applied)
  const [pendingCountryFilter, setPendingCountryFilter] = useState<string[]>([]);
  const [pendingEventNameFilter, setPendingEventNameFilter] = useState('');
  const [pendingImpactFilter, setPendingImpactFilter] = useState<string[]>([]);
  const [pendingPeriodFromFilter, setPendingPeriodFromFilter] = useState<Date | null>(null);
  const [pendingPeriodToFilter, setPendingPeriodToFilter] = useState<Date | null>(null);

  // Applied filters (committed filters that trigger API calls)
  const [appliedCountryFilter, setAppliedCountryFilter] = useState<string[]>([]);
  const [appliedEventNameFilter, setAppliedEventNameFilter] = useState('');
  const [appliedImpactFilter, setAppliedImpactFilter] = useState<string[]>([]);
  const [appliedPeriodFromFilter, setAppliedPeriodFromFilter] = useState<Date | null>(null);
  const [appliedPeriodToFilter, setAppliedPeriodToFilter] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const [actionDrawerOpened, setActionDrawerOpened] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

  const [debouncedAppliedEventNameFilter] = useDebouncedValue(appliedEventNameFilter, 500);

  // Apply pending filters to applied filters
  const applyFilters = () => {
    setAppliedCountryFilter(pendingCountryFilter);
    setAppliedEventNameFilter(pendingEventNameFilter);
    setAppliedImpactFilter(pendingImpactFilter);
    setAppliedPeriodFromFilter(pendingPeriodFromFilter);
    setAppliedPeriodToFilter(pendingPeriodToFilter);
    setPage(1); // Reset to first page when applying new filters
  };

  // Check if there are pending changes
  const hasPendingChanges =
    JSON.stringify(pendingCountryFilter) !== JSON.stringify(appliedCountryFilter) ||
    pendingEventNameFilter !== appliedEventNameFilter ||
    JSON.stringify(pendingImpactFilter) !== JSON.stringify(appliedImpactFilter) ||
    pendingPeriodFromFilter?.getTime() !== appliedPeriodFromFilter?.getTime() ||
    pendingPeriodToFilter?.getTime() !== appliedPeriodToFilter?.getTime();

  // Only fetch when applied filters change
  useEffect(() => {
    const filters: EconomicCalendarFilters = {
      countryCodes: appliedCountryFilter.length > 0 ? appliedCountryFilter : undefined,
      eventName: debouncedAppliedEventNameFilter || undefined,
      impactLevels:
        appliedImpactFilter.length > 0
          ? (appliedImpactFilter.map(Number) as (1 | 2 | 3)[])
          : undefined,
      periodFrom: appliedPeriodFromFilter?.getTime(),
      periodTo: appliedPeriodToFilter?.getTime(),
      page,
      pageSize: 100,
    };

    fetchEvents(filters);
  }, [
    appliedCountryFilter,
    debouncedAppliedEventNameFilter,
    appliedImpactFilter,
    appliedPeriodFromFilter,
    appliedPeriodToFilter,
    page,
    fetchEvents,
  ]);

  const clearFilters = () => {
    // Clear both pending and applied filters
    setPendingCountryFilter([]);
    setPendingEventNameFilter('');
    setPendingImpactFilter([]);
    setPendingPeriodFromFilter(null);
    setPendingPeriodToFilter(null);
    setAppliedCountryFilter([]);
    setAppliedEventNameFilter('');
    setAppliedImpactFilter([]);
    setAppliedPeriodFromFilter(null);
    setAppliedPeriodToFilter(null);
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

    // Set pending filters and immediately apply
    setPendingPeriodFromFilter(range.start);
    setPendingPeriodToFilter(range.end);
    setAppliedPeriodFromFilter(range.start);
    setAppliedPeriodToFilter(range.end);
    setPage(1);
  };

  const applyQuickCountryFilter = (country: string) => {
    // Set pending filter and immediately apply
    setPendingCountryFilter([country]);
    setAppliedCountryFilter([country]);
    setPage(1);
  };

  const handleActionsClick = (event: EconomicEvent) => {
    setSelectedEvent(event);
    setActionDrawerOpened(true);
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <Stack gap="lg" py="xl" w={isMobile ? '90vw' : '80vw'}>
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
                  countryFilter={pendingCountryFilter}
                  onCountryFilterChange={setPendingCountryFilter}
                  eventNameFilter={pendingEventNameFilter}
                  onEventNameFilterChange={setPendingEventNameFilter}
                  impactFilter={pendingImpactFilter}
                  onImpactFilterChange={setPendingImpactFilter}
                  periodFromFilter={pendingPeriodFromFilter}
                  onPeriodFromFilterChange={setPendingPeriodFromFilter}
                  periodToFilter={pendingPeriodToFilter}
                  onPeriodToFilterChange={setPendingPeriodToFilter}
                  onClearFilters={clearFilters}
                  onApplyFilters={applyFilters}
                  hasPendingChanges={hasPendingChanges}
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
                  <EventCard key={event.ts} event={event} onActionsClick={handleActionsClick} />
                ))}
              </Stack>
            ) : (
              <EventTable events={events} onActionsClick={handleActionsClick} />
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

      <ReservationDrawer
        opened={actionDrawerOpened}
        onClose={() => setActionDrawerOpened(false)}
        event={selectedEvent}
      />
    </>
  );
}

export default EconomicCalendar;
