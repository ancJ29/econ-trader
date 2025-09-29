import { Table, Text, Paper, Stack, Badge, ScrollArea, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { TransactionHistory, TradingMarket } from '@/types/account';
import { MARKET_LABELS } from '@/constants/markets';

interface TransactionHistoryTableProps {
  transactionData: Partial<Record<TradingMarket, TransactionHistory[]>>;
}

export function TransactionHistoryTable({ transactionData }: TransactionHistoryTableProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const markets = Object.keys(transactionData) as TradingMarket[];

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trade':
        return 'blue';
      case 'fee':
        return 'orange';
      case 'funding':
        return 'grape';
      case 'swap':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getSideColor = (side?: string) => {
    if (!side) return 'gray';
    return side === 'buy' ? 'green' : 'red';
  };

  if (markets.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="lg">
        {t('noTransactionHistory')}
      </Text>
    );
  }

  if (isMobile) {
    return (
      <Stack gap="md">
        {markets.map((market) => {
          const transactions = transactionData[market] || [];
          if (transactions.length === 0) return null;

          return (
            <Paper key={market} withBorder p="md">
              <Text size="sm" fw={500} mb="md">
                {MARKET_LABELS[market]}
              </Text>
              <Stack gap="sm">
                {transactions.map((transaction) => (
                  <Paper key={transaction.id} withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="lg">
                        {transaction.symbol}
                      </Text>
                      <Badge color={getTypeColor(transaction.type)} size="lg">
                        {t(`transaction.${transaction.type}`)}
                      </Badge>
                    </Group>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('transaction.amount')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatNumber(transaction.amount, 8)} {transaction.coin}
                        </Text>
                      </Group>
                      {transaction.side && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            {t('transaction.side')}
                          </Text>
                          <Badge color={getSideColor(transaction.side)} size="sm">
                            {t(`order.${transaction.side}`)}
                          </Badge>
                        </Group>
                      )}
                      {transaction.price && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            {t('transaction.price')}
                          </Text>
                          <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                            {formatNumber(transaction.price)}
                          </Text>
                        </Group>
                      )}
                      {transaction.quantity && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            {t('transaction.quantity')}
                          </Text>
                          <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                            {formatNumber(transaction.quantity, 4)}
                          </Text>
                        </Group>
                      )}
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('transaction.description')}
                        </Text>
                        <Text size="sm" fw={500}>
                          {transaction.description}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t('transaction.timestamp')}
                        </Text>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {formatDateTime(transaction.timestamp)}
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
        const transactions = transactionData[market] || [];
        if (transactions.length === 0) return null;

        return (
          <Paper key={market} withBorder p="md">
            <Text size="sm" fw={500} mb="sm">
              {MARKET_LABELS[market]}
            </Text>
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('transaction.type')}</Table.Th>
                    <Table.Th>{t('transaction.symbol')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('transaction.amount')}</Table.Th>
                    <Table.Th>{t('transaction.coin')}</Table.Th>
                    <Table.Th>{t('transaction.side')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('transaction.price')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('transaction.quantity')}</Table.Th>
                    <Table.Th>{t('transaction.description')}</Table.Th>
                    <Table.Th>{t('transaction.timestamp')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {transactions.map((transaction) => (
                    <Table.Tr key={transaction.id}>
                      <Table.Td>
                        <Badge color={getTypeColor(transaction.type)} size="sm">
                          {t(`transaction.${transaction.type}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>{transaction.symbol}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumber(transaction.amount, 8)}
                      </Table.Td>
                      <Table.Td>{transaction.coin}</Table.Td>
                      <Table.Td>
                        {transaction.side ? (
                          <Badge color={getSideColor(transaction.side)} size="sm">
                            {t(`order.${transaction.side}`)}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {transaction.price ? formatNumber(transaction.price) : '-'}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {transaction.quantity ? formatNumber(transaction.quantity, 4) : '-'}
                      </Table.Td>
                      <Table.Td>{transaction.description}</Table.Td>
                      <Table.Td style={{ fontFamily: 'monospace' }}>
                        {formatDateTime(transaction.timestamp)}
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
