import { Table, Text, Paper, Stack, Badge, ScrollArea, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { OrderInformation, TradingMarket } from '@/types/account';
import { MARKET_LABELS } from '@/constants/markets';

interface OrderHistoryTableProps {
  ordersData: Partial<Record<TradingMarket, OrderInformation[]>>;
}

export function OrderHistoryTable({ ordersData }: OrderHistoryTableProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const markets = Object.keys(ordersData) as TradingMarket[];

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'partially_filled':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'green' : 'red';
  };

  if (markets.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="lg">
        {t('noOrderHistory')}
      </Text>
    );
  }

  if (isMobile) {
    return (
      <Stack gap="md">
        {markets.map((market) => {
          const orders = ordersData[market] || [];
          if (orders.length === 0) return null;

          return (
            <Paper key={market} withBorder p="md">
              <Text size="sm" fw={500} mb="md">
                {MARKET_LABELS[market]}
              </Text>
              <Stack gap="sm">
                {orders.map((order) => (
                  <Paper key={order.id} withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="lg">
                        {order.symbol}
                      </Text>
                      <Badge color={getSideColor(order.side)} size="lg">
                        {t(`order.${order.side}`)}
                      </Badge>
                    </Group>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.type')}
                        </Text>
                        <Text size="sm" fw={500}>
                          {t(
                            `order.${order.type === 'stop_loss' ? 'stopLoss' : order.type === 'take_profit' ? 'takeProfit' : order.type}`
                          )}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.status')}
                        </Text>
                        <Badge color={getStatusColor(order.status)} size="sm">
                          {t(
                            `order.${order.status === 'partially_filled' ? 'partiallyFilled' : order.status}`
                          )}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.quantity')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(order.quantity, 4)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.filled')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(order.filledQuantity, 4)}
                        </Text>
                      </Group>
                      {order.averagePrice && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            {t('order.averagePrice')}
                          </Text>
                          <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                            {formatNumber(order.averagePrice)}
                          </Text>
                        </Group>
                      )}
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.updatedAt')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatDateTime(order.updatedAt)}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {markets.map((market) => {
        const orders = ordersData[market] || [];
        if (orders.length === 0) return null;

        return (
          <Paper key={market} withBorder p="md">
            <Text size="sm" fw={500} mb="sm">
              {MARKET_LABELS[market]}
            </Text>
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('order.symbol')}</Table.Th>
                    <Table.Th>{t('order.side')}</Table.Th>
                    <Table.Th>{t('order.type')}</Table.Th>
                    <Table.Th>{t('order.status')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('order.quantity')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('order.filled')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('order.averagePrice')}</Table.Th>
                    <Table.Th>{t('order.updatedAt')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orders.map((order) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>
                        <Text fw={500}>{order.symbol}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getSideColor(order.side)} size="sm">
                          {t(`order.${order.side}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {t(
                          `order.${order.type === 'stop_loss' ? 'stopLoss' : order.type === 'take_profit' ? 'takeProfit' : order.type}`
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(order.status)} size="sm">
                          {t(
                            `order.${order.status === 'partially_filled' ? 'partiallyFilled' : order.status}`
                          )}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(order.quantity, 4)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(order.filledQuantity, 4)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {order.averagePrice ? formatNumber(order.averagePrice) : '-'}
                      </Table.Td>
                      <Table.Td style={{ fontFamily: 'monospace' }}>
                        {formatDateTime(order.updatedAt)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        );
      })}
    </Stack>
  );
}
