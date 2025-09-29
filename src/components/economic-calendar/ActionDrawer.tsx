import { useEffect, useState } from 'react';
import {
  Drawer,
  Stack,
  Title,
  Text,
  Button,
  Card,
  Group,
  Badge,
  Switch,
  Select,
  NumberInput,
  Alert,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useActionStore } from '@/store/actionStore';
import { useAccountStore } from '@/store/accountStore';
import { AccountSelector } from './AccountSelector';
import { MarketSelector } from './MarketSelector';
import { InstrumentSelector } from './InstrumentSelector';
import type { CreateActionInput } from '@/services/action';
import type { Account, TradingMarket, TradingSymbol } from '@/types/account';

interface ActionDrawerProps {
  opened: boolean;
  onClose: () => void;
  eventCode: string;
  eventName: string;
}

export function ActionDrawer({ opened, onClose, eventCode, eventName }: ActionDrawerProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const {
    actions,
    isLoading,
    error,
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    toggleEnabled,
  } = useActionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();

  const form = useForm<CreateActionInput>({
    initialValues: {
      eventCode,
      eventName,
      accountId: '',
      market: '' as TradingMarket,
      triggerType: 'actual_vs_forecast',
      condition: 'greater',
      instrument: '' as TradingSymbol,
      side: 'buy',
      quantity: 1,
      orderType: 'market',
      limitPrice: undefined,
      enabled: true,
    },
    validate: {
      accountId: (value) => (!value ? t('action.accountRequired') : null),
      market: (value) => (!value ? t('action.marketRequired') : null),
      instrument: (value) => (!value ? t('action.instrumentRequired') : null),
      quantity: (value) => (value <= 0 ? t('action.quantityPositive') : null),
      limitPrice: (value, values) =>
        values.orderType === 'limit' && (!value || value <= 0)
          ? t('action.limitPriceRequired')
          : null,
    },
  });

  useEffect(() => {
    if (opened) {
      fetchActions(eventCode);
      fetchAccounts();
    }
  }, [opened, eventCode, fetchActions, fetchAccounts]);

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.name} (${account.exchange})` : accountId;
  };

  const handleSubmit = async (values: CreateActionInput) => {
    try {
      if (editingId) {
        await updateAction({ id: editingId, ...values });
      } else {
        await createAction(values);
      }
      form.reset();
      setIsFormOpen(false);
      setEditingId(null);
    } catch (_err) {
      // Error is handled by store
    }
  };

  const handleEdit = (id: string) => {
    const action = actions.find((a) => a.id === id);
    if (action) {
      form.setValues({
        eventCode: action.eventCode,
        eventName: action.eventName,
        accountId: action.accountId,
        market: action.market,
        triggerType: action.triggerType,
        condition: action.condition,
        instrument: action.instrument,
        side: action.side,
        quantity: action.quantity,
        orderType: action.orderType,
        limitPrice: action.limitPrice,
        enabled: action.enabled,
      });
      setEditingId(id);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('action.confirmDelete'))) {
      await deleteAction(id);
    }
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <Drawer
      styles={{
        content: isMobile
          ? {
              borderRadius: 'var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0',
            }
          : undefined,
      }}
      opened={opened}
      onClose={onClose}
      withCloseButton={true}
      position={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '95vh' : 'lg'}
      title={
        <Stack gap="xs">
          <Title order={3}>{t('action.title')}</Title>
          <Text size="sm" c="dimmed">
            {eventName}
          </Text>
        </Stack>
      }
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" title={t('error')}>
            {error}
          </Alert>
        )}

        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>{t('action.addAction')}</Button>
        )}

        {isFormOpen && (
          <Card withBorder p="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Title order={5}>
                  {editingId ? t('action.editAction') : t('action.newAction')}
                </Title>

                <Select
                  label={t('action.triggerType')}
                  data={[
                    { value: 'actual_vs_forecast', label: t('action.actualVsForecast') },
                    { value: 'actual_vs_previous', label: t('action.actualVsPrevious') },
                  ]}
                  {...form.getInputProps('triggerType')}
                  required
                />

                <Select
                  label={t('action.condition')}
                  data={[
                    { value: 'greater', label: t('action.greater') },
                    { value: 'less', label: t('action.less') },
                  ]}
                  {...form.getInputProps('condition')}
                  required
                />

                <Divider label={t('action.tradingAccount')} />

                <AccountSelector
                  value={form.values.accountId}
                  onChange={(accountId, account) => {
                    form.setFieldValue('accountId', accountId || '');
                    setSelectedAccount(account);
                    // Reset market and instrument when account changes
                    if (accountId !== form.values.accountId) {
                      form.setFieldValue('market', '' as TradingMarket);
                      form.setFieldValue('instrument', '' as TradingSymbol);
                    }
                  }}
                  error={form.errors.accountId as string | undefined}
                />

                <MarketSelector
                  value={form.values.market}
                  onChange={(market) => {
                    form.setFieldValue('market', market || ('' as TradingMarket));
                    // Reset instrument when market changes
                    if (market !== form.values.market) {
                      form.setFieldValue('instrument', '' as TradingSymbol);
                    }
                  }}
                  availableMarkets={selectedAccount?.availableMarkets}
                  disabled={!form.values.accountId}
                  error={form.errors.market as string | undefined}
                />

                <InstrumentSelector
                  value={form.values.instrument}
                  onChange={(instrument) => {
                    form.setFieldValue('instrument', instrument || ('' as TradingSymbol));
                  }}
                  availableInstruments={
                    form.values.market && selectedAccount?.availableMarkets
                      ? (selectedAccount.availableMarkets[form.values.market] as
                          | TradingSymbol[]
                          | undefined)
                      : undefined
                  }
                  disabled={!form.values.market}
                  error={form.errors.instrument as string | undefined}
                />

                <Divider label={t('action.orderDetails')} />

                <Select
                  label={t('action.side')}
                  data={[
                    { value: 'buy', label: t('action.buy') },
                    { value: 'sell', label: t('action.sell') },
                  ]}
                  {...form.getInputProps('side')}
                  required
                />

                <NumberInput
                  label={t('action.quantity')}
                  min={0.01}
                  step={0.01}
                  decimalScale={2}
                  {...form.getInputProps('quantity')}
                  required
                />

                <Select
                  label={t('action.orderType')}
                  data={[
                    { value: 'market', label: t('action.market') },
                    { value: 'limit', label: t('action.limit') },
                  ]}
                  {...form.getInputProps('orderType')}
                  required
                />

                {form.values.orderType === 'limit' && (
                  <NumberInput
                    label={t('action.limitPrice')}
                    min={0.01}
                    step={0.01}
                    decimalScale={2}
                    {...form.getInputProps('limitPrice')}
                    required
                  />
                )}

                <Group justify="flex-end">
                  <Button variant="subtle" onClick={handleCancelEdit}>
                    {t('action.cancel')}
                  </Button>
                  <Button type="submit" loading={isLoading}>
                    {editingId ? t('action.update') : t('action.create')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        )}

        {actions.length === 0 && !isFormOpen && (
          <Card withBorder p="xl">
            <Stack align="center" gap="md">
              <Text c="dimmed">{t('action.noActions')}</Text>
            </Stack>
          </Card>
        )}

        {actions.length > 0 && (
          <Stack gap="md">
            {actions.map((action) => (
              <Card key={action.id} withBorder p="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Badge color={action.side === 'buy' ? 'green' : 'red'}>
                        {t(`action.${action.side}`)}
                      </Badge>
                      <Text fw={500}>{action.instrument}</Text>
                      <Badge variant="light">{action.quantity}</Badge>
                      <Badge variant="dot" color="blue">
                        {action.market}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Switch
                        checked={action.enabled}
                        onChange={() => toggleEnabled(action.id)}
                        label={action.enabled ? t('action.enabled') : t('action.disabled')}
                        size="sm"
                      />
                      <Button variant="subtle" size="xs" onClick={() => handleEdit(action.id)}>
                        {t('action.edit')}
                      </Button>
                      <Button
                        variant="subtle"
                        size="xs"
                        color="red"
                        onClick={() => handleDelete(action.id)}
                      >
                        {t('action.delete')}
                      </Button>
                    </Group>
                  </Group>

                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {t('action.account')}:
                    </Text>
                    <Text size="sm">{getAccountName(action.accountId)}</Text>
                  </Group>

                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {t('action.trigger')}:
                    </Text>
                    <Text size="sm">
                      {t(`action.${action.triggerType}`)} {t(`action.${action.condition}`)}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {t('action.order')}:
                    </Text>
                    <Text size="sm">
                      {t(`action.${action.orderType}`)}
                      {action.orderType === 'limit' && action.limitPrice
                        ? ` @ ${action.limitPrice}`
                        : ''}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
