import type { CreateReservationInput } from '@/services/reservation';
import type { Account, TradingMarket, TradingSymbol } from '@/types/account';
import { Button, Card, Divider, Group, NumberInput, Select, Stack, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { AccountSelector } from './AccountSelector';
import { MarketSelector } from './MarketSelector';
import { SymbolSelector } from './SymbolSelector';

interface ReservationFormProps {
  form: UseFormReturnType<CreateReservationInput>;
  selectedAccount: Account | undefined;
  setSelectedAccount: (account: Account | undefined) => void;
  onSubmit: (values: CreateReservationInput) => Promise<void>;
  onCancel: () => void;
  editingId: string | null;
}

export function ReservationForm({
  form,
  selectedAccount,
  setSelectedAccount,
  onSubmit,
  onCancel,
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
              { value: 'actual_vs_specific', label: t('action.actualVsSpecific') },
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

          {form.values.triggerType === 'actual_vs_specific' && (
            <NumberInput
              label={t('action.specificValue')}
              placeholder={t('action.enterSpecificValue')}
              step={0.01}
              decimalScale={2}
              {...form.getInputProps('specificValue')}
              required
            />
          )}

          <Divider label={t('action.tradingAccount')} />

          <AccountSelector
            value={form.values.accountId}
            onChange={(accountId, account) => {
              form.setFieldValue('accountId', accountId || '');
              setSelectedAccount(account);
              // Reset market and symbol when account changes
              if (accountId !== form.values.accountId) {
                form.setFieldValue('market', '' as TradingMarket);
                form.setFieldValue('symbol', '' as TradingSymbol);
              }
            }}
            error={form.errors.accountId as string | undefined}
          />

          <MarketSelector
            value={form.values.market}
            onChange={(market) => {
              form.setFieldValue('market', market || ('' as TradingMarket));
              // Reset symbol when market changes
              if (market !== form.values.market) {
                form.setFieldValue('symbol', '' as TradingSymbol);
              }
            }}
            availableMarkets={selectedAccount?.availableMarkets}
            disabled={!form.values.accountId}
            error={form.errors.market as string | undefined}
          />

          <SymbolSelector
            value={form.values.symbol}
            onChange={(symbol) => {
              form.setFieldValue('symbol', symbol || ('' as TradingSymbol));
            }}
            availableSymbols={
              form.values.market && selectedAccount?.availableMarkets
                ? (selectedAccount.availableMarkets[form.values.market] as
                    | TradingSymbol[]
                    | undefined)
                : undefined
            }
            disabled={!form.values.market}
            error={form.errors.symbol as string | undefined}
          />

          <Divider label={t('action.orderDetails')} />

          <Select
            label={t('action.side')}
            data={[
              { value: 'BUY', label: t('action.BUY') },
              { value: 'SELL', label: t('action.SELL') },
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
            {...form.getInputProps('volume')}
            required
          />

          <Select
            label={t('action.orderType')}
            data={[
              { value: 'MARKET', label: t('action.market') },
              { value: 'LIMIT', label: t('action.limit') },
            ]}
            {...form.getInputProps('orderType')}
            required
          />

          {form.values.orderType === 'LIMIT' && (
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
            <Button type="submit">{editingId ? t('action.update') : t('action.create')}</Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
