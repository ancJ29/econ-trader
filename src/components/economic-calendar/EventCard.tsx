import { Card, Stack, Group, Text, Badge, Anchor, Divider, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Flag } from '@/components/common/Flag';
import type { EconomicEvent } from '@/services/economicCalendar';

interface EventCardProps {
  event: EconomicEvent;
  formatDate: (timestamp: number) => string;
  getImpactColor: (impact: number) => string;
  getImpactLabel: (impact: number) => string;
  formatValue: (value: number | undefined, isPercentage: boolean) => string;
}

export function EventCard({
  event,
  formatDate,
  getImpactColor,
  getImpactLabel,
  formatValue,
}: EventCardProps) {
  const { t } = useTranslation();

  return (
    <Card key={event.ts} padding="md" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text size="sm" c="dimmed">
            {formatDate(event.ts)}
          </Text>
          <Badge color={getImpactColor(event.impact)} size="sm">
            {getImpactLabel(event.impact)}
          </Badge>
        </Group>

        <Anchor component={Link} to={`/economic-calendar/${event.eventCode}`} fw={600}>
          {event.name}
        </Anchor>

        <Group gap="xs">
          <Group gap={4}>
            <Flag countryCode={event.countryCode} size="md" />
            <Text size="sm" fw={500}>
              {event.countryCode}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {event.period}
          </Text>
        </Group>

        <Divider />

        <SimpleGrid cols={3}>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('actual')}
            </Text>
            <Text size="sm" fw={500}>
              {formatValue(event.actual, event.isPercentage)}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('forecast')}
            </Text>
            <Text size="sm" fw={500}>
              {formatValue(event.forecast, event.isPercentage)}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('previous')}
            </Text>
            <Text size="sm" fw={500}>
              {formatValue(event.previous, event.isPercentage)}
            </Text>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
