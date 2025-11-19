import { MARKET_LABELS } from '@/constants/markets';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { OrderInformation, TradingMarket } from '@/types/account';
import {
  formatDateTime,
  formatNumber,
  getOrderSideColor,
  getOrderStatusColor,
} from '@/utils/formatters';
import { Badge, Group, Paper, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { OrderType } from '../common/OrderType';

interface OpenOrdersTableProps {
  ordersData: Partial<Record<TradingMarket, OrderInformation[]>>;
}

export function OpenOrdersTable({ ordersData }: OpenOrdersTableProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const markets = Object.keys(ordersData) as TradingMarket[];

  if (markets.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="lg">
        {t('noOpenOrders')}
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
                      <Badge color={getOrderSideColor(order.side)} size="lg">
                        {t(`order.${order.side}`)}
                      </Badge>
                    </Group>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.type')}
                        </Text>
                        <Text size="sm" fw={500}>
                          <OrderType type={order.type} />
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.status')}
                        </Text>
                        <Badge color={getOrderStatusColor(order.status)} size="sm">
                          {order.status}
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
                      {order.price && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            {t('order.price')}
                          </Text>
                          <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                            {formatNumber(order.price)}
                          </Text>
                        </Group>
                      )}
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.timeInForce')}
                        </Text>
                        <Text size="sm" fw={500}>
                          {t(`order.${order.timeInForce}`)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('order.createdAt')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatDateTime(order.createdAt)}
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
                    <Table.Th style={{ textAlign: 'right' }}>{t('order.price')}</Table.Th>
                    <Table.Th>{t('order.timeInForce')}</Table.Th>
                    <Table.Th>{t('order.createdAt')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orders.map((order) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>
                        <Text fw={500}>{order.symbol}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getOrderSideColor(order.side)} size="sm">
                          {t(`order.${order.side}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <OrderType type={order.type} />
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getOrderStatusColor(order.status)} size="sm">
                          {order.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(order.quantity, 4)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(order.filledQuantity, 4)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {order.price ? formatNumber(order.price) : '-'}
                      </Table.Td>
                      <Table.Td>{t(`order.${order.timeInForce}`)}</Table.Td>
                      <Table.Td style={{ fontFamily: 'monospace' }}>
                        {formatDateTime(order.createdAt)}
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
