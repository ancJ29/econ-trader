import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Switch,
  SimpleGrid,
  Tooltip,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Reservation } from '@/services/reservation';
import { formatNumber } from '@/utils/formatters';

interface ReservationCardProps {
  reservation: Reservation;
  getAccountName: (accountId: string) => string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

export function ReservationCard({
  reservation,
  getAccountName,
  onEdit,
  onDelete,
  onToggleEnabled,
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

        <Group gap="xs">
          <Text size="base" fw="500" c="dimmed">
            {t('accounts')}:
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
            <Text size="sm">{t(`exchanges.${reservation.market}`)}</Text>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('order.side')}:
            </Text>
            <Badge color={reservation.side === 'buy' ? 'green' : 'red'}>
              {t(`action.${reservation.side}`)}
            </Badge>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('common.instruments')}:
            </Text>
            <Text size="sm">{reservation.instrument}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('common.volume')}:
            </Text>
            {/* TODO: load digits from config */}
            <Text size="sm">{formatNumber(reservation.quantity, 4)}</Text>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('economicCalendars.trigger')}:
            </Text>
            <Text size="sm">
              {t(`action.${reservation.triggerType}`)} {t(`action.${reservation.condition}`)}
            </Text>
          </Group>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('action.order')}:
            </Text>
            <Text size="sm">
              {t(`order.${reservation.orderType}`)}
              {/* TODO: load digits from config */}
              {reservation.orderType === 'limit' && reservation.limitPrice
                ? ` @ ${formatNumber(reservation.limitPrice, 4)}`
                : ''}
            </Text>
          </Group>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
