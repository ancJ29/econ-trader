import { Card, Stack, Group, Text, Badge, Timeline, Divider } from '@mantine/core';
import {
  IconCalendarTime,
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { EconomicEvent } from '@/services/economicCalendar';
import { formatDate, formatValue, getImpactColor, getImpactLabel } from '@/utils/economicCalendar';

interface EventDetailsCardProps {
  event: EconomicEvent;
}

export function EventDetailsCard({ event }: EventDetailsCardProps) {
  const { t } = useTranslation();

  // Helper function to determine comparison icon and color
  const getComparisonIndicator = (actual?: number, forecast?: number) => {
    if (actual === undefined || forecast === undefined) return null;

    if (actual > forecast) {
      return { icon: IconTrendingUp, color: 'green', label: t('economicCalendars.aboveForecast') };
    }
    if (actual < forecast) {
      return { icon: IconTrendingDown, color: 'red', label: t('economicCalendars.belowForecast') };
    }
    return { icon: IconMinus, color: 'gray', label: t('economicCalendars.asForecast') };
  };

  const comparison = getComparisonIndicator(event.actual, event.forecast);

  return (
    <Card withBorder>
      <Stack gap="sm">
        {/* Event Name and Impact */}
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {event.name}
          </Text>
          <Badge color={getImpactColor(event.impact)} size="lg">
            {getImpactLabel(event.impact, t)}
          </Badge>
        </Group>

        <Divider />

        {/* Time and Location Info */}
        <Group gap="lg">
          <Group gap="xs">
            <IconCalendarTime size={16} />
            <Text size="sm" c="dimmed">
              {formatDate(event.ts)}
            </Text>
          </Group>
          <Badge variant="light">{event.countryCode}</Badge>
          <Badge variant="light">{event.currencyCode}</Badge>
        </Group>

        {/* Period and Interval */}
        <Group gap="md">
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('economicCalendars.time')}:
            </Text>
            <Text size="sm" fw={500}>
              {event.period}
            </Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('economicCalendars.interval')}:
            </Text>
            <Text size="sm" fw={500}>
              {event.interval}
            </Text>
          </Group>
        </Group>

        <Divider />

        {/* Key Values */}
        <Stack gap="sm">
          <Text fw={600} size="sm">
            {t('economicCalendars.keyMetrics')}
          </Text>

          <Timeline active={-1} bulletSize={20}>
            {/* Previous Value */}
            <Timeline.Item
              title={t('economicCalendars.previous')}
              bullet={<IconChartBar size={14} />}
            >
              <Text size="lg" fw={600}>
                {formatValue(event.previous, event.isPercentage)}
              </Text>
            </Timeline.Item>

            {/* Forecast Value */}
            <Timeline.Item
              title={t('economicCalendars.forecast')}
              bullet={<IconChartBar size={14} />}
            >
              <Text size="lg" fw={600}>
                {formatValue(event.forecast, event.isPercentage)}
              </Text>
            </Timeline.Item>

            {/* Actual Value with comparison */}
            <Timeline.Item
              title={t('economicCalendars.actual')}
              bullet={comparison?.icon ? <comparison.icon size={14} /> : <IconChartBar size={14} />}
              color={comparison?.color}
            >
              <Group gap="xs">
                <Text size="lg" fw={700} c={comparison?.color}>
                  {formatValue(event.actual, event.isPercentage)}
                </Text>
                {comparison && (
                  <Badge size="sm" color={comparison.color} variant="light">
                    {comparison.label}
                  </Badge>
                )}
              </Group>
            </Timeline.Item>
          </Timeline>
        </Stack>
      </Stack>
    </Card>
  );
}
