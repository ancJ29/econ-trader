import { Table, Text, Paper, Stack, Badge, ScrollArea, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { PositionInformation, TradingMarket } from '@/types/account';
import { MARKET_LABELS } from '@/constants/markets';
import {
  formatNumber,
  formatPnl,
  getPnlColor,
  formatLeverage,
  getPositionSideColor,
} from '@/utils/formatters';

interface PositionTableProps {
  positionData: Partial<Record<TradingMarket, PositionInformation[]>>;
}

export function PositionTable({ positionData }: PositionTableProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const markets = Object.keys(positionData) as TradingMarket[];

  if (markets.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="lg">
        {t('noPositionData')}
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
                {positions.map((position, idx) => (
                  <Paper key={`${position.symbol}-${idx}`} withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="lg">
                        {position.symbol}
                      </Text>
                      <Badge color={getPositionSideColor(position.side)} size="lg">
                        {t(`position.${position.side}`)}
                      </Badge>
                    </Group>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.quantity')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.quantity, 4)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.entryPrice')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.entryPrice)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.markPrice')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.markPrice)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.liquidationPrice')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(position.liquidationPrice)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.leverage')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatLeverage(position.leverage)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.unrealizedPnl')}
                        </Text>
                        <Text
                          size="sm"
                          fw={500}
                          c={getPnlColor(position.unrealizedPnl)}
                          style={{ fontFamily: 'monospace' }}
                        >
                          {formatPnl(position.unrealizedPnl)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('position.realizedPnl')}
                        </Text>
                        <Text
                          size="sm"
                          fw={500}
                          c={getPnlColor(position.realizedPnl)}
                          style={{ fontFamily: 'monospace' }}
                        >
                          {formatPnl(position.realizedPnl)}
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
                    <Table.Th>{t('position.symbol')}</Table.Th>
                    <Table.Th>{t('position.side')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('position.quantity')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('position.entryPrice')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('position.markPrice')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('position.liquidationPrice')}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('position.leverage')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('position.unrealizedPnl')}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('position.realizedPnl')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {positions.map((position, idx) => (
                    <Table.Tr key={`${position.symbol}-${idx}`}>
                      <Table.Td>
                        <Text fw={500}>{position.symbol}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getPositionSideColor(position.side)} size="sm">
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
                        {formatNumber(position.markPrice)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(position.liquidationPrice)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {position.leverage}x
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text
                          size="sm"
                          fw={500}
                          c={getPnlColor(position.unrealizedPnl)}
                          style={{ fontFamily: 'monospace' }}
                        >
                          {formatPnl(position.unrealizedPnl)}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text
                          size="sm"
                          fw={500}
                          c={getPnlColor(position.realizedPnl)}
                          style={{ fontFamily: 'monospace' }}
                        >
                          {formatPnl(position.realizedPnl)}
                        </Text>
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
