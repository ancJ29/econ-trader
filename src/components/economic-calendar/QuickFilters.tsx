import { Stack, Text, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Flag } from '@/components/common/Flag';

interface QuickFiltersProps {
  isMobile: boolean;
  onTimeFilterClick: (type: 'thisWeek' | 'nextWeek' | 'thisMonth' | 'nextMonth') => void;
  onCountryFilterClick: (country: string) => void;
}

export function QuickFilters({
  isMobile,
  onTimeFilterClick,
  onCountryFilterClick,
}: QuickFiltersProps) {
  const { t } = useTranslation();

  const timeFilterButtons = (
    <>
      <Button radius="sm" size="xs" variant="filled" onClick={() => onTimeFilterClick('thisWeek')}>
        {t('thisWeek')}
      </Button>
      <Button radius="sm" size="xs" variant="filled" onClick={() => onTimeFilterClick('nextWeek')}>
        {t('nextWeek')}
      </Button>
      <Button radius="sm" size="xs" variant="filled" onClick={() => onTimeFilterClick('thisMonth')}>
        {t('thisMonth')}
      </Button>
    </>
  );

  const countryFilterButtons = (
    <>
      <Button
        radius="sm"
        size="xs"
        variant="filled"
        color="gold"
        onClick={() => onCountryFilterClick('US')}
      >
        <Group gap={4}>
          {!isMobile && <Flag countryCode="US" size="xs" />}
          <span>US</span>
        </Group>
      </Button>
      <Button
        radius="sm"
        size="xs"
        variant="filled"
        color="gold"
        onClick={() => onCountryFilterClick('EU')}
      >
        <Group gap={4}>
          {!isMobile && <Flag countryCode="EU" size="xs" />}
          <span>EU</span>
        </Group>
      </Button>
      <Button
        radius="sm"
        size="xs"
        variant="filled"
        color="gold"
        onClick={() => onCountryFilterClick('CN')}
      >
        <Group gap={4}>
          {!isMobile && <Flag countryCode="CN" size="xs" />}
          <span>CN</span>
        </Group>
      </Button>
      <Button
        radius="sm"
        size="xs"
        variant="filled"
        color="gold"
        onClick={() => onCountryFilterClick('JP')}
      >
        <Group gap={4}>
          {!isMobile && <Flag countryCode="JP" size="xs" />}
          <span>JP</span>
        </Group>
      </Button>
      <Button
        radius="sm"
        size="xs"
        variant="filled"
        color="gold"
        onClick={() => onCountryFilterClick('GB')}
      >
        <Group gap={4}>
          {!isMobile && <Flag countryCode="GB" size="xs" />}
          <span>GB</span>
        </Group>
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Stack gap="xs">
        <Text size="sm" fw={500} c="dimmed">
          {t('quickFilters')}
        </Text>

        <Group gap="xs" wrap="wrap">
          {timeFilterButtons}
        </Group>
        <Group gap="xs" wrap="nowrap">
          {countryFilterButtons}
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500} c="dimmed">
        {t('quickFilters')}
      </Text>
      <Group gap="xs" wrap="wrap">
        {timeFilterButtons}
        {countryFilterButtons}
      </Group>
    </Stack>
  );
}
