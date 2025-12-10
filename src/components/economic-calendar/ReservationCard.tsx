import { MARKET_LABELS } from '@/constants/markets';
import type { Reservation } from '@/services/reservation';
import { formatNumber } from '@/utils/formatters';
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { OrderType } from '../common/OrderType';

interface ReservationCardProps {
  reservation: Reservation;
  getAccountName: (accountId: string) => string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  isToggling: boolean;
}

export function ReservationCard({
  reservation,
  getAccountName,
  onEdit,
  onDelete,
  onToggleEnabled,
  isToggling,
}: ReservationCardProps) {
  const { t } = useTranslation();

  const handleDelete = () => {
    if (confirm(t('action.confirmDelete'))) {
      onDelete(reservation.id);
    }
  };

  return (
    <Card withBorder p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Switch
            checked={reservation.enabled}
            onChange={() => onToggleEnabled(reservation.id)}
            label={reservation.enabled ? t('action.enabled') : t('action.disabled')}
            size="sm"
            color={reservation.enabled ? 'green' : 'gray'}
            disabled={isToggling}
          />
          <Group gap="xs">
            <Tooltip label={t('action.edit')} position="top">
              <Button variant="subtle" size="xs" onClick={() => onEdit(reservation.id)}>
                {t('action.edit')}
              </Button>
            </Tooltip>
            <Tooltip label={t('action.delete')} position="top">
              <Button variant="subtle" size="xs" color="red" onClick={handleDelete}>
                {t('action.delete')}
              </Button>
            </Tooltip>
          </Group>
        </Group>

        <Text size="lg" fw={700}>
          {reservation.eventName}
        </Text>

        <Group gap="xs">
          <Text size="base" fw="500" c="dimmed">
            {t('account.list')}:
          </Text>
          <Text size="base" fw="600">
            {getAccountName(reservation.accountId)}
          </Text>
        </Group>

        <SimpleGrid cols={2}>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('markets')}:
            </Text>
            <Text size="sm">{MARKET_LABELS[reservation.market]}</Text>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('order.side')}:
            </Text>
            <Badge color={reservation.side === 'BUY' ? 'green' : 'red'}>
              {t(`action.${reservation.side}`)}
            </Badge>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('common.symbols')}:
            </Text>
            <Text size="sm">{reservation.symbol}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('common.volume')}:
            </Text>
            {/* TODO: load digits from config */}
            <Text size="sm">{formatNumber(reservation.volume, 4)}</Text>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('economicCalendars.trigger')}:
            </Text>
            <Text size="sm">
              {reservation.triggerType === 'actual_vs_specific' && reservation.specificValue
                ? `${t('action.actualVs')} ${formatNumber(reservation.specificValue, 2)} ${t(`action.${reservation.condition}`)}`
                : `${t(`action.${reservation.triggerType}`)} ${t(`action.${reservation.condition}`)}`}
            </Text>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('action.order')}:
            </Text>
            <Text size="sm">
              <OrderType type={reservation.orderType} />
              {/* TODO: load digits from config */}
              {reservation.orderType === 'LIMIT' && reservation.limitPrice
                ? ` @ ${formatNumber(reservation.limitPrice, 4)}`
                : ''}
            </Text>
          </Group>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
