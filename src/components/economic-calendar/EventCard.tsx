import { Flag } from '@/components/common/Flag';
import type { EconomicEvent } from '@/types/calendar';
import { formatDate, formatValue, getImpactColor, getImpactLabel } from '@/utils/economicCalendar';
import {
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: EconomicEvent;
  onActionsClick: (event: EconomicEvent) => void;
}

export function EventCard({ event, onActionsClick }: EventCardProps) {
  const { t } = useTranslation();

  return (
    <Card key={event.uniqueCode} padding="md" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text size="sm" c="dimmed">
            {formatDate(event.ts)}
          </Text>
          <Badge color={getImpactColor(event.impact)} size="sm">
            {getImpactLabel(event.impact, t)}
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
              {t('economicCalendars.actual')}
            </Text>
            <Text size="sm" fw={500}>
              {formatValue(event.actual, event.isPercentage)}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('economicCalendars.forecast')}
            </Text>
            <Text size="sm" fw={500}>
              {formatValue(event.forecast, event.isPercentage)}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('economicCalendars.previous')}
            </Text>
            <Text size="sm" fw={500}>
              {formatValue(event.previous, event.isPercentage)}
            </Text>
          </Stack>
        </SimpleGrid>

        <Button size="xs" variant="light" fullWidth onClick={() => onActionsClick(event)}>
          {t('economicCalendars.manageReservations')}
        </Button>
      </Stack>
    </Card>
  );
}
