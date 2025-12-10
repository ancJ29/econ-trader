import { useEffect, useState, useCallback, useMemo } from 'react';
import { Title, Stack, Alert, Group, Text, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useReservationStore } from '@/store/reservationStore';
import { useAccountStore } from '@/store/accountStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { ReservationList } from '@/components/economic-calendar/ReservationList';
import type { CreateReservationInput } from '@/services/reservation';
import { useForm } from '@mantine/form';
import type { TradingMarket } from '@/types/account';
import { ReservationForm } from '@/components/economic-calendar/ReservationForm';
import { Drawer, ScrollArea } from '@mantine/core';

function Reservations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    reservations,
    fetchAllReservations,
    updateReservation,
    deleteReservation,
    toggleEnabled,
    isLoading,
    error,
  } = useReservationStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const isMobile = useIsMobile();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const form = useForm<CreateReservationInput>({
    initialValues: {
      uniqueCode: '',
      eventCode: '',
      eventName: '',
      accountId: '',
      market: '' as TradingMarket,
      triggerType: 'actual_vs_forecast',
      condition: 'greater',
      symbol: '',
      side: 'BUY',
      volume: 1,
      orderType: 'MARKET',
      limitPrice: undefined,
      enabled: true,
    },
    validate: {
      accountId: (value) => (!value ? t('action.accountRequired') : null),
      market: (value) => (!value ? t('action.marketRequired') : null),
      symbol: (value) => (!value ? t('action.symbolRequired') : null),
      volume: (value) => (value <= 0 ? t('action.quantityPositive') : null),
      limitPrice: (value, values) =>
        values.orderType === 'LIMIT' && (!value || value <= 0)
          ? t('action.limitPriceRequired')
          : null,
    },
  });

  useEffect(() => {
    fetchAllReservations();
    fetchAccounts();
  }, [fetchAllReservations, fetchAccounts]);

  const getAccountName = useCallback(
    (accountId: string) => {
      const account = accounts.find((a) => a.id === accountId);
      return account ? `${account.name} (${account.exchange})` : accountId;
    },
    [accounts]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const reservation = reservations.find((r) => r.id === id);
      if (reservation) {
        form.setValues({
          uniqueCode: reservation.uniqueCode,
          eventCode: reservation.eventCode,
          eventName: reservation.eventName,
          accountId: reservation.accountId,
          market: reservation.market,
          triggerType: reservation.triggerType,
          specificValue: reservation.specificValue,
          condition: reservation.condition,
          symbol: reservation.symbol,
          side: reservation.side,
          volume: reservation.volume,
          orderType: reservation.orderType,
          limitPrice: reservation.limitPrice,
          enabled: reservation.enabled,
        });
        setEditingId(id);
        setIsEditDrawerOpen(true);
      }
    },
    [form, reservations]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (updatingId) return;
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return;

      setUpdatingId(id);
      try {
        await deleteReservation(reservation.uniqueCode, id);
      } finally {
        setUpdatingId(null);
      }
    },
    [reservations, deleteReservation, updatingId]
  );

  const handleToggleEnabled = useCallback(
    async (id: string) => {
      if (updatingId) return;
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return;

      setUpdatingId(id);
      try {
        await toggleEnabled(reservation.uniqueCode, id);
      } finally {
        setUpdatingId(null);
      }
    },
    [reservations, toggleEnabled, updatingId]
  );

  const handleSubmit = useCallback(
    async (values: CreateReservationInput) => {
      if (!editingId || updatingId) return;

      setUpdatingId(editingId);
      try {
        await updateReservation({ id: editingId, ...values });
        setIsEditDrawerOpen(false);
        setEditingId(null);
        form.reset();
      } catch (_err) {
        // Error is handled by store
      } finally {
        setUpdatingId(null);
      }
    },
    [editingId, updatingId, form, updateReservation]
  );

  const handleCancelEdit = useCallback(() => {
    form.reset();
    setIsEditDrawerOpen(false);
    setEditingId(null);
    setUpdatingId(null);
  }, [form]);

  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => b.createdAt - a.createdAt);
  }, [reservations]);

  return (
    <>
      <Stack gap="lg" py="xl" w={isMobile ? '90vw' : '80vw'}>
        <Group justify="space-between" align="center">
          <Title order={1}>{t('economicCalendars.myReservations')}</Title>
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title={t('error')} color="red">
            {error}
          </Alert>
        )}

        {sortedReservations.length === 0 && !isLoading && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            <Stack gap="sm">
              <Text>{t('economicCalendars.noReservations')}</Text>
              <Button
                onClick={() => navigate('/economic-calendar')}
                style={{ alignSelf: 'flex-start' }}
              >
                {t('economicCalendars.browseCalendar')}
              </Button>
            </Stack>
          </Alert>
        )}

        {sortedReservations.length > 0 && (
          <ReservationList
            reservations={sortedReservations}
            getAccountName={getAccountName}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleEnabled={handleToggleEnabled}
            updatingId={updatingId}
          />
        )}
      </Stack>

      <Drawer
        styles={{
          content: isMobile
            ? {
                borderRadius: 'var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0',
              }
            : undefined,
        }}
        opened={isEditDrawerOpen}
        onClose={handleCancelEdit}
        withCloseButton={true}
        position={isMobile ? 'bottom' : 'right'}
        size={isMobile ? '95vh' : 'lg'}
        title={
          <Text size="lg" fw={600}>
            {t('economicCalendars.editReservation')}
          </Text>
        }
      >
        <ScrollArea h={isMobile ? '90vh' : 'calc(100vh - 100px)'} scrollbarSize={8}>
          <Stack gap="md" pb="xl">
            <ReservationForm
              form={form}
              selectedAccount={accounts.find((a) => a.id === form.values.accountId)}
              editingId={editingId}
              onSubmit={handleSubmit}
              onCancel={handleCancelEdit}
              setSelectedAccount={(account) => {
                if (account) {
                  form.setFieldValue('accountId', account.id);
                }
              }}
            />
          </Stack>
        </ScrollArea>
      </Drawer>

      <LoadingOverlay visible={isLoading} message={t('loading')} />
    </>
  );
}

export default Reservations;
