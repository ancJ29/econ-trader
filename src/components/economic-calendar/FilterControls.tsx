import { useState } from 'react';
import { Stack, MultiSelect, TextInput, Button, SimpleGrid, Collapse, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import { Flag } from '@/components/common/Flag';

interface FilterControlsProps {
  countryFilter: string[];
  onCountryFilterChange: (value: string[]) => void;
  eventNameFilter: string;
  onEventNameFilterChange: (value: string) => void;
  impactFilter: string[];
  onImpactFilterChange: (value: string[]) => void;
  periodFromFilter: Date | null;
  onPeriodFromFilterChange: (value: Date | null) => void;
  periodToFilter: Date | null;
  onPeriodToFilterChange: (value: Date | null) => void;
  onClearFilters: () => void;
  isMobile: boolean;
  countryOptions: readonly { value: string; label: string }[];
}

export function FilterControls({
  countryFilter,
  onCountryFilterChange,
  eventNameFilter,
  onEventNameFilterChange,
  impactFilter,
  onImpactFilterChange,
  periodFromFilter,
  onPeriodFromFilterChange,
  periodToFilter,
  onPeriodToFilterChange,
  onClearFilters,
  isMobile,
  countryOptions,
}: FilterControlsProps) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const impactOptions = [
    { value: '1', label: t('impactLow') },
    { value: '2', label: t('impactMedium') },
    { value: '3', label: t('impactHigh') },
  ];

  const filterInputs = (
    <>
      <MultiSelect
        label={t('filterCountry')}
        placeholder={t('selectCountries')}
        data={countryOptions as { value: string; label: string }[]}
        value={countryFilter}
        onChange={onCountryFilterChange}
        clearable
        searchable
        renderOption={({ option }) => (
          <Group gap={6}>
            <Flag countryCode={option.value} size="sm" />
            <span>{option.label}</span>
          </Group>
        )}
      />
      <MultiSelect
        label={t('filterImpact')}
        placeholder={t('selectImpact')}
        data={impactOptions}
        value={impactFilter}
        onChange={onImpactFilterChange}
        clearable
      />
      <DateInput
        label={t('filterPeriodFrom')}
        placeholder={t('selectDate')}
        value={periodFromFilter}
        onChange={(value) => onPeriodFromFilterChange(value ? new Date(value) : null)}
        clearable
      />
      <DateInput
        label={t('filterPeriodTo')}
        placeholder={t('selectDate')}
        value={periodToFilter}
        onChange={(value) => onPeriodToFilterChange(value ? new Date(value) : null)}
        clearable
      />
    </>
  );

  if (isMobile) {
    return (
      <Stack gap="md">
        <Button onClick={() => setOpened(!opened)} variant="light" fullWidth>
          {opened ? t('hideFilters') : t('showFilters')}
        </Button>
        <Collapse in={opened}>
          <Stack gap="md">
            {filterInputs}
            <TextInput
              label={t('filterEventName')}
              placeholder={t('searchEventName')}
              value={eventNameFilter}
              onChange={(e) => onEventNameFilterChange(e.currentTarget.value)}
            />
          </Stack>
        </Collapse>
        <Button onClick={onClearFilters} variant="outline" fullWidth>
          {t('clearFilters')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={2} spacing="md">
        {filterInputs}
      </SimpleGrid>
      <TextInput
        label={t('filterEventName')}
        placeholder={t('searchEventName')}
        value={eventNameFilter}
        onChange={(e) => onEventNameFilterChange(e.currentTarget.value)}
      />
      <Button onClick={onClearFilters} variant="outline">
        {t('clearFilters')}
      </Button>
    </Stack>
  );
}
