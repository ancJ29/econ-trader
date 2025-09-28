import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Anchor,
  Divider,
  SimpleGrid,
  Button,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Flag } from '@/components/common/Flag';
import { getImpactColor, getImpactLabel, formatDate, formatValue } from '@/utils/economicCalendar';
import type { EconomicEvent } from '@/services/economicCalendar';

interface EventCardProps {
  event: EconomicEvent;
  onActionsClick: (eventCode: string, eventName: string) => void;
}

export function EventCard({ event, onActionsClick }: EventCardProps) {
  const { t } = useTranslation();

  return (
    <Card key={event.ts} padding="md" radius="md" withBorder>
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

        <Button
          size="xs"
          variant="light"
          fullWidth
          onClick={() => onActionsClick(event.eventCode, event.name)}
        >
          {t('action.manageActions')}
        </Button>
      </Stack>
    </Card>
  );
}
