import { Stack, Title, Select, Divider, NumberInput, Group, Button, Card } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { AccountSelector } from './AccountSelector';
import { MarketSelector } from './MarketSelector';
import { InstrumentSelector } from './InstrumentSelector';
import type { CreateReservationInput } from '@/services/reservation';
import type { Account, TradingMarket, TradingSymbol } from '@/types/account';

interface ReservationFormProps {
  form: UseFormReturnType<CreateReservationInput>;
  selectedAccount: Account | undefined;
  setSelectedAccount: (account: Account | undefined) => void;
  onSubmit: (values: CreateReservationInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  editingId: string | null;
}

export function ReservationForm({
  form,
  selectedAccount,
  setSelectedAccount,
  onSubmit,
  onCancel,
  isLoading,
  editingId,
}: ReservationFormProps) {
  const { t } = useTranslation();

  return (
    <Card withBorder p="md">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Title order={5}>
            {editingId
              ? t('economicCalendars.editReservation')
              : t('economicCalendars.newReservation')}
          </Title>

          <Select
            label={t('economicCalendars.triggerType')}
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
            min={0.0001}
            step={0.0001}
            // TODO: load digits from config
            decimalScale={4}
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
              min={0.0001}
              step={0.0001}
              // TODO: load digits from config
              decimalScale={4}
              {...form.getInputProps('limitPrice')}
              required
            />
          )}

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onCancel}>
              {t('action.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {editingId ? t('action.update') : t('action.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
