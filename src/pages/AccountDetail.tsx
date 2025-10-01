import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Title,
  Stack,
  Alert,
  Paper,
  Group,
  Text,
  Badge,
  Button,
  Anchor,
  Breadcrumbs,
  Drawer,
} from '@mantine/core';
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/store/accountStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { MarketSelector } from '@/components/accounts/MarketSelector';
import { BalanceTable } from '@/components/accounts/BalanceTable';
import { PositionTable } from '@/components/accounts/PositionTable';
import { OpenOrdersTable } from '@/components/accounts/OpenOrdersTable';
import { OrderHistoryTable } from '@/components/accounts/OrderHistoryTable';
import { PositionHistoryTable } from '@/components/accounts/PositionHistoryTable';
import { TransactionHistoryTable } from '@/components/accounts/TransactionHistoryTable';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MARKET_LABELS } from '@/constants/markets';
import type { TradingMarket, TradingSymbol } from '@/types/account';
import { maskString } from '@/utils/string';

function AccountDetailContent() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { accountId } = useParams<{ accountId: string }>();
  const { selectedAccount, selectAccount, updateMarkets, isLoading, error } = useAccountStore();

  const [marketDrawerOpened, setMarketDrawerOpened] = useState(false);
  const [tempMarkets, setTempMarkets] = useState<Partial<Record<TradingMarket, TradingSymbol[]>>>(
    {}
  );

  // Removed the fetchAccounts effect - selectAccount now handles fetching if needed

  useEffect(() => {
    if (accountId) {
      // selectAccount is now async and will fetch the account if needed
      selectAccount(accountId);
    }
  }, [accountId, selectAccount]);

  const handleOpenMarketDrawer = () => {
    setTempMarkets(selectedAccount?.availableMarkets || {});
    setMarketDrawerOpened(true);
  };

  const handleSaveMarkets = async () => {
    if (!selectedAccount) return;

    try {
      await updateMarkets(selectedAccount.id, tempMarkets);
      setMarketDrawerOpened(false);
    } catch (err) {
      console.error('Failed to update markets:', err);
    }
  };

  if (isLoading && !selectedAccount) {
    return <LoadingOverlay visible={true} message={t('loading')} />;
  }

  if (!selectedAccount && !isLoading) {
    return (
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor component={Link} to="/accounts">
            {t('account.list')}
          </Anchor>
          <Text>{t('notFound')}</Text>
        </Breadcrumbs>

        <Alert icon={<IconAlertCircle size={16} />} title={t('error')} color="red">
          {t('accountNotFound')}
        </Alert>

        <Button component={Link} to="/accounts" leftSection={<IconChevronLeft size={18} />}>
          {t('backToAccounts')}
        </Button>
      </Stack>
    );
  }

  if (!selectedAccount) return null;

  const getMarketCount = () => {
    return Object.keys(selectedAccount.availableMarkets || {}).length;
  };

  return (
    <Stack gap="lg" py="xl" w={isMobile ? '90vw' : '80vw'}>
      <Breadcrumbs>
        <Anchor component={Link} to="/accounts">
          {t('account.list')}
        </Anchor>
        <Text>{selectedAccount.name}</Text>
      </Breadcrumbs>

      <Group justify="space-between" align="center">
        <Group>
          <Title order={1}>{selectedAccount.name}</Title>
          <Badge color={selectedAccount.isActive ? 'green' : 'gray'} size="lg">
            {selectedAccount.isActive ? t('active') : t('inactive')}
          </Badge>
        </Group>
        <Button component={Link} to="/accounts" variant="default">
          {t('backToAccounts')}
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title={t('error')} color="red">
          {error}
        </Alert>
      )}

      <Paper withBorder p="lg">
        <Stack gap="md">
          <Group>
            <div>
              <Text size="sm" c="dimmed">
                {t('exchange')}
              </Text>
              <Text size="lg" fw={500}>
                {selectedAccount.exchange}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                {t('markets')}
              </Text>
              <Text size="lg" fw={500}>
                {getMarketCount()}
              </Text>
            </div>
          </Group>

          <div>
            <Text size="sm" c="dimmed">
              {t('apiKey')}
            </Text>
            <Text size="md" fw={500} style={{ fontFamily: 'monospace' }}>
              {maskString(selectedAccount.apiKey, 8)}
            </Text>
          </div>

          <div>
            <Text size="sm" c="dimmed">
              {t('createdAt')}
            </Text>
            <Text size="md" fw={500}>
              {new Date(selectedAccount.createdAt).toLocaleString()}
            </Text>
          </div>

          <div>
            <Text size="sm" c="dimmed">
              {t('updatedAt')}
            </Text>
            <Text size="md" fw={500}>
              {new Date(selectedAccount.updatedAt).toLocaleString()}
            </Text>
          </div>
        </Stack>
      </Paper>

      <Paper withBorder p="lg">
        <Group justify="space-between" align="center" mb="md">
          <Text size="lg" fw={500}>
            {t('marketConfiguration')}
          </Text>
          <Button size="sm" onClick={handleOpenMarketDrawer}>
            {t('manageMarkets')}
          </Button>
        </Group>

        {Object.keys(selectedAccount.availableMarkets || {}).length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            {t('noMarketsConfigured')}
          </Alert>
        ) : (
          <Stack gap="sm">
            {Object.entries(selectedAccount.availableMarkets || {}).map(([market, symbols]) => {
              const symbolArray = Array.isArray(symbols) ? symbols : [];
              return (
                <div key={market}>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      {MARKET_LABELS[market as TradingMarket]}
                    </Text>
                    <Badge size="sm" variant="light">
                      {symbolArray.length} {t('symbolsSelected')}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>
                    {symbolArray.join(', ')}
                  </Text>
                </div>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper withBorder p="lg">
        <Text size="lg" fw={500} mb="md">
          {t('balanceInformation')}
        </Text>
        <BalanceTable balanceData={selectedAccount.balanceInformation || {}} />
      </Paper>

      <Paper withBorder p="lg">
        <Text size="lg" fw={500} mb="md">
          {t('positionInformation')}
        </Text>
        <PositionTable positionData={selectedAccount.positionInformation || {}} />
      </Paper>

      <Paper withBorder p="lg">
        <Text size="lg" fw={500} mb="md">
          {t('openOrders')}
        </Text>
        <OpenOrdersTable ordersData={selectedAccount.openOrders || {}} />
      </Paper>

      <Paper withBorder p="lg">
        <Text size="lg" fw={500} mb="md">
          {t('orderHistory')}
        </Text>
        <OrderHistoryTable ordersData={selectedAccount.orderHistory || {}} />
      </Paper>

      <Paper withBorder p="lg">
        <Text size="lg" fw={500} mb="md">
          {t('positionHistory')}
        </Text>
        <PositionHistoryTable positionData={selectedAccount.positionHistory || {}} />
      </Paper>

      <Paper withBorder p="lg">
        <Text size="lg" fw={500} mb="md">
          {t('transactionHistory')}
        </Text>
        <TransactionHistoryTable transactionData={selectedAccount.transactionHistory || {}} />
      </Paper>

      <Drawer
        styles={{
          content: isMobile
            ? {
                borderRadius: 'var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0',
              }
            : {},
        }}
        opened={marketDrawerOpened}
        onClose={() => setMarketDrawerOpened(false)}
        withCloseButton={true}
        position={isMobile ? 'bottom' : 'right'}
        size={isMobile ? '95vh' : 'lg'}
        title={
          <Stack gap="xs">
            <Title order={3}>{t('manageMarkets')}</Title>
            <Text size="sm" c="dimmed">
              {selectedAccount?.name}
            </Text>
          </Stack>
        }
      >
        <Stack gap="md">
          {selectedAccount && (
            <MarketSelector
              exchange={selectedAccount.exchange}
              value={tempMarkets}
              onChange={setTempMarkets}
            />
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setMarketDrawerOpened(false)}>
              {t('action.cancel')}
            </Button>
            <Button onClick={handleSaveMarkets}>{t('updateMarkets')}</Button>
          </Group>
        </Stack>
      </Drawer>
    </Stack>
  );
}

function AccountDetail() {
  return (
    <ErrorBoundary>
      <AccountDetailContent />
    </ErrorBoundary>
  );
}

export default AccountDetail;
