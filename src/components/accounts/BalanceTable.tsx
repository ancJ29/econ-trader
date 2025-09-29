import { Table, Text, Paper, Stack, Group, ScrollArea } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { BalanceInformation, TradingMarket } from '@/types/account';
import { MARKET_LABELS } from '@/constants/markets';
import { formatCurrency } from '@/utils/formatters';

interface BalanceTableProps {
  balanceData: Partial<Record<TradingMarket, BalanceInformation[]>>;
}

export function BalanceTable({ balanceData }: BalanceTableProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const markets = Object.keys(balanceData) as TradingMarket[];

  if (markets.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="lg">
        {t('noBalanceData')}
      </Text>
    );
  }

  if (isMobile) {
    return (
      <Stack gap="md">
        {markets.map((market) => {
          const balances = balanceData[market] || [];
          if (balances.length === 0) return null;

          return (
            <Paper key={market} withBorder p="md">
              <Text size="sm" fw={500} mb="md">
                {MARKET_LABELS[market]}
              </Text>
              <Stack gap="sm">
                {balances.map((balance, idx) => (
                  <Paper key={`${balance.symbol}-${idx}`} withBorder p="sm">
                    <Text fw={700} size="lg" mb="xs">
                      {balance.symbol}
                    </Text>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('balance.balance')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatCurrency(balance.balance, balance.symbol)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('balance.available')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatCurrency(balance.available, balance.symbol)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('balance.inOrder')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatCurrency(balance.inOrder, balance.symbol)}
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
        const balances = balanceData[market] || [];
        if (balances.length === 0) return null;

        return (
          <Paper key={market} withBorder p="md">
            <Text size="sm" fw={500} mb="sm">
              {MARKET_LABELS[market]}
            </Text>
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('balance.symbol')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('balance.balance')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('balance.available')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('balance.inOrder')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {balances.map((balance, idx) => (
                    <Table.Tr key={`${balance.symbol}-${idx}`}>
                      <Table.Td>
                        <Text fw={500}>{balance.symbol}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(balance.balance, balance.symbol)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(balance.available, balance.symbol)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(balance.inOrder, balance.symbol)}
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
