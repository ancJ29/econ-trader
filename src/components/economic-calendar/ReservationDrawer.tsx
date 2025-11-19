import { useIsMobile } from '@/hooks/useIsMobile';
import type { CreateReservationInput } from '@/services/reservation';
import { useAccountStore } from '@/store/accountStore';
import { useReservationStore } from '@/store/reservationStore';
import type { Account, TradingMarket, TradingSymbol } from '@/types/account';
import type { EconomicEvent } from '@/types/calendar';
import {
  ActionIcon,
  Alert,
  Button,
  Collapse,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventDetailsCard } from './EventDetailsCard';
import { ReservationEmptyState } from './ReservationEmptyState';
import { ReservationForm } from './ReservationForm';
import { ReservationList } from './ReservationList';

interface ReservationDrawerProps {
  opened: boolean;
  event: EconomicEvent | null;
  onClose: () => void;
}

export function ReservationDrawer({ opened, event, onClose }: ReservationDrawerProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const {
    reservations,
    isLoading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    deleteReservation,
    toggleEnabled,
  } = useReservationStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const form = useForm<CreateReservationInput>({
    initialValues: {
      uniqueCode: '',
      eventCode: '',
      eventName: '',
      accountId: '',
      market: '' as TradingMarket,
      triggerType: 'actual_vs_forecast',
      condition: 'greater',
      symbol: '' as TradingSymbol,
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

  // Fetch data when drawer opens
  useEffect(() => {
    if (opened && event) {
      setIsInitialLoading(true);
      Promise.all([fetchReservations(event.uniqueCode), fetchAccounts()]).finally(() => {
        setIsInitialLoading(false);
      });
    }
  }, [opened, event, fetchReservations, fetchAccounts]);

  // Update form when event changes
  useEffect(() => {
    if (event && !editingId) {
      form.setValues({
        ...form.values,
        uniqueCode: event.uniqueCode,
        eventCode: event.eventCode,
        eventName: event.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.uniqueCode, event?.eventCode, event?.name, editingId]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!opened) {
      setIsFormOpen(false);
      setEditingId(null);
      setSelectedAccount(undefined);
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const getAccountName = useCallback(
    (accountId: string) => {
      const account = accounts.find((a) => a.id === accountId);
      return account ? `${account.name} (${account.exchange})` : accountId;
    },
    [accounts]
  );

  const handleSubmit = useCallback(
    async (values: CreateReservationInput) => {
      if (updatingId) return;
      if (editingId) {
        setUpdatingId(editingId);
      }
      try {
        if (editingId) {
          await updateReservation({ id: editingId, ...values });
        } else {
          await createReservation(values);
        }
        form.reset();
        setIsFormOpen(false);
        setEditingId(null);
        setSelectedAccount(undefined);
      } catch (_err) {
        // Error is handled by store
      } finally {
        setUpdatingId(null);
      }
    },
    [editingId, updatingId, form, createReservation, updateReservation]
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
        setIsFormOpen(true);
      }
    },
    [form, reservations]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!event || updatingId) return;
      setUpdatingId(id);
      try {
        await deleteReservation(event.uniqueCode, id);
      } finally {
        setUpdatingId(null);
      }
    },
    [event, deleteReservation, updatingId]
  );

  const handleToggleEnabled = useCallback(
    async (id: string) => {
      if (!event || updatingId) return;
      setUpdatingId(id);
      try {
        await toggleEnabled(event.uniqueCode, id);
      } finally {
        setUpdatingId(null);
      }
    },
    [event, toggleEnabled, updatingId]
  );

  const handleCancelEdit = useCallback(() => {
    form.reset();
    setIsFormOpen(false);
    setEditingId(null);
    setUpdatingId(null);
    setSelectedAccount(undefined);
    if (event) {
      form.setValues({
        ...form.values,
        uniqueCode: event.uniqueCode,
        eventCode: event.eventCode,
        eventName: event.name,
      });
    }
  }, [form, event]);

  const handleDrawerClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingId(null);
    setSelectedAccount(undefined);
    form.reset();
    onClose();
  }, [form, onClose]);

  const hasReservations = useMemo(() => reservations.length > 0, [reservations.length]);

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
      onClose={handleDrawerClose}
      withCloseButton={true}
      position={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '95vh' : 'lg'}
      title={
        <Text size="lg" fw={600}>
          {event?.name || t('action.title')}
        </Text>
      }
    >
      <ScrollArea h={isMobile ? '90vh' : 'calc(100vh - 100px)'} scrollbarSize={8}>
        <LoadingOverlay visible={isInitialLoading || isLoading} />
        <Stack gap="md" pb="xl">
          {/* Event Details Section */}
          {event && (
            <>
              <Group
                mb="sm"
                justify="space-between"
                align="center"
                onClick={() => setIsEventDetailsOpen(!isEventDetailsOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Title order={5}>{t('economicCalendars.eventDetails')}</Title>
                <ActionIcon variant="subtle" size="lg">
                  {isEventDetailsOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
              </Group>
              <Collapse in={isEventDetailsOpen}>
                <Stack gap="sm">
                  <EventDetailsCard event={event} />
                  <Divider />
                </Stack>
              </Collapse>
            </>
          )}

          {/* Error Alert */}
          {error && (
            <Alert color="red" title={t('error')}>
              {error}
            </Alert>
          )}

          {/* Reservations Section */}
          <Stack gap="sm">
            <Title order={4}>{t('economicCalendars.reservationList')}</Title>

            {!isFormOpen && (
              <Button onClick={() => setIsFormOpen(true)}>
                {t('economicCalendars.addReservation')}
              </Button>
            )}

            {isFormOpen && (
              <ReservationForm
                form={form}
                selectedAccount={selectedAccount}
                editingId={editingId}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                setSelectedAccount={setSelectedAccount}
              />
            )}

            {!hasReservations && !isFormOpen && !isInitialLoading && <ReservationEmptyState />}

            {hasReservations && (
              <ReservationList
                reservations={reservations}
                getAccountName={getAccountName}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleEnabled={handleToggleEnabled}
                updatingId={updatingId ?? ''}
              />
            )}
          </Stack>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
