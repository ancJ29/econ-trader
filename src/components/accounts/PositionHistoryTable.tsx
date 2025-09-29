import { Table, Text, Paper, Stack, Badge, ScrollArea, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { PositionHistory, TradingMarket } from '@/types/account';
import { MARKET_LABELS } from '@/constants/markets';

interface PositionHistoryTableProps {
  positionData: Partial<Record<TradingMarket, PositionHistory[]>>;
}

export function PositionHistoryTable({ positionData }: PositionHistoryTableProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const markets = Object.keys(positionData) as TradingMarket[];

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPnl = (value: number) => {
    const color = value >= 0 ? 'green' : 'red';
    const sign = value >= 0 ? '+' : '';
    return (
      <Text c={color} fw={500} style={{ fontFamily: 'monospace' }}>
        {sign}
        {formatNumber(value)}
      </Text>
    );
  };

  if (markets.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="lg">
        {t('noPositionHistory')}
      </Text>
    );
  }

  if (isMobile) {
    return (
      <Stack gap="md">
        {markets.map((market) => {
          const positions = positionData[market] || [];
          if (positions.length === 0) return null;

          return (
            <Paper key={market} withBorder p="md">
              <Text size="sm" fw={500} mb="md">
                {MARKET_LABELS[market]}
              </Text>
              <Stack gap="sm">
                {positions.map((position) => (
                  <Paper key={position.id} withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="lg">
                        {position.symbol}
                      </Text>
                      <Badge color={position.side === 'long' ? 'green' : 'red'} size="lg">
                        {t(`position.${position.side}`)}
                      </Badge>
                    </Group>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('positionHist.quantity')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.quantity, 4)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('positionHist.entryPrice')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.entryPrice)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('positionHist.exitPrice')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.exitPrice)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('positionHist.realizedPnl')}
                        </Text>
                        {formatPnl(position.realizedPnl)}
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('positionHist.leverage')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {position.leverage}x
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('positionHist.closedAt')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatDateTime(position.closedAt)}
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
        const positions = positionData[market] || [];
        if (positions.length === 0) return null;

        return (
          <Paper key={market} withBorder p="md">
            <Text size="sm" fw={500} mb="sm">
              {MARKET_LABELS[market]}
            </Text>
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('positionHist.symbol')}</Table.Th>
                    <Table.Th>{t('positionHist.side')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('positionHist.quantity')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('positionHist.entryPrice')}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('positionHist.exitPrice')}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('positionHist.realizedPnl')}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('positionHist.leverage')}</Table.Th>
                    <Table.Th>{t('positionHist.closedAt')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {positions.map((position) => (
                    <Table.Tr key={position.id}>
                      <Table.Td>
                        <Text fw={500}>{position.symbol}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={position.side === 'long' ? 'green' : 'red'} size="sm">
                          {t(`position.${position.side}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(position.quantity, 4)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(position.entryPrice)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(position.exitPrice)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        {formatPnl(position.realizedPnl)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {position.leverage}x
                      </Table.Td>
                      <Table.Td style={{ fontFamily: 'monospace' }}>
                        {formatDateTime(position.closedAt)}
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
