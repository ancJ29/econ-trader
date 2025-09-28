import { Table, Badge, Anchor, Group, Text, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Flag } from '@/components/common/Flag';
import { getImpactColor, getImpactLabel, formatDate, formatValue } from '@/utils/economicCalendar';
import type { EconomicEvent } from '@/services/economicCalendar';

interface EventTableProps {
  events: EconomicEvent[];
  onActionsClick: (eventCode: string, eventName: string) => void;
}

export function EventTable({ events, onActionsClick }: EventTableProps) {
  const { t } = useTranslation();

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('date')}</Table.Th>
          <Table.Th>{t('country')}</Table.Th>
          <Table.Th>{t('event')}</Table.Th>
          <Table.Th>{t('period')}</Table.Th>
          <Table.Th>{t('impact')}</Table.Th>
          <Table.Th>{t('actual')}</Table.Th>
          <Table.Th>{t('forecast')}</Table.Th>
          <Table.Th>{t('previous')}</Table.Th>
          <Table.Th>{t('action.actions')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {events.map((event: EconomicEvent) => (
          <Table.Tr key={event.ts}>
            <Table.Td>{formatDate(event.ts)}</Table.Td>
            <Table.Td>
              <Group gap={6}>
                <Flag countryCode={event.countryCode} size="md" />
                <Text size="sm">{event.countryCode}</Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Anchor component={Link} to={`/economic-calendar/${event.eventCode}`}>
                {event.name}
              </Anchor>
            </Table.Td>
            <Table.Td>{event.period}</Table.Td>
            <Table.Td>
              <Badge color={getImpactColor(event.impact)}>{getImpactLabel(event.impact, t)}</Badge>
            </Table.Td>
            <Table.Td>{formatValue(event.actual, event.isPercentage)}</Table.Td>
            <Table.Td>{formatValue(event.forecast, event.isPercentage)}</Table.Td>
            <Table.Td>{formatValue(event.previous, event.isPercentage)}</Table.Td>
            <Table.Td>
              <Button
                size="xs"
                variant="light"
                onClick={() => onActionsClick(event.eventCode, event.name)}
              >
                {t('action.manage')}
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
