import { useEffect, useState } from 'react';
import {
  Drawer,
  Stack,
  Title,
  Button,
  Alert,
  Divider,
  ScrollArea,
  Collapse,
  Group,
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useReservationStore } from '@/store/reservationStore';
import { useAccountStore } from '@/store/accountStore';
import { ReservationForm } from './ReservationForm';
import { ReservationList } from './ReservationList';
import { ReservationEmptyState } from './ReservationEmptyState';
import { EventDetailsCard } from './EventDetailsCard';
import type { CreateReservationInput } from '@/services/reservation';
import type { Account, TradingMarket, TradingSymbol } from '@/types/account';
import type { EconomicEvent } from '@/services/economicCalendar';

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

  const form = useForm<CreateReservationInput>({
    initialValues: {
      eventCode: '',
      eventName: '',
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
    if (opened && event) {
      fetchReservations(event.eventCode);
      fetchAccounts();
      // Update form with new event data
      form.setFieldValue('eventCode', event.eventCode);
      form.setFieldValue('eventName', event.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, event, fetchReservations, fetchAccounts]);

  useEffect(() => {
    setIsFormOpen(false);
    // Reset form when switching events
    if (!editingId) {
      form.reset();
      if (event) {
        form.setFieldValue('eventCode', event.eventCode);
        form.setFieldValue('eventName', event.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.eventCode, editingId]);

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.name} (${account.exchange})` : accountId;
  };

  const handleSubmit = async (values: CreateReservationInput) => {
    try {
      if (editingId) {
        await updateReservation({ id: editingId, ...values });
      } else {
        await createReservation(values);
      }
      form.reset();
      setIsFormOpen(false);
      setEditingId(null);
    } catch (_err) {
      // Error is handled by store
    }
  };

  const handleEdit = (id: string) => {
    const reservation = reservations.find((r) => r.id === id);
    if (reservation) {
      form.setValues({
        eventCode: reservation.eventCode,
        eventName: reservation.eventName,
        accountId: reservation.accountId,
        market: reservation.market,
        triggerType: reservation.triggerType,
        condition: reservation.condition,
        instrument: reservation.instrument,
        side: reservation.side,
        quantity: reservation.quantity,
        orderType: reservation.orderType,
        limitPrice: reservation.limitPrice,
        enabled: reservation.enabled,
      });
      setEditingId(id);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('action.confirmDelete'))) {
      await deleteReservation(id);
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
      title={<Title order={3}>{event?.name || t('action.title')}</Title>}
    >
      <ScrollArea h={isMobile ? '90vh' : 'calc(100vh - 100px)'} scrollbarSize={8}>
        <Stack gap="md" pb="xl">
          {/* Display event details if event is available */}
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

          {error && (
            <Alert color="red" title={t('error')}>
              {error}
            </Alert>
          )}

          {/* Actions Section */}
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
                setSelectedAccount={setSelectedAccount}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                isLoading={isLoading}
                editingId={editingId}
              />
            )}

            {reservations.length === 0 && !isFormOpen && <ReservationEmptyState />}

            {reservations.length > 0 && (
              <ReservationList
                reservations={reservations}
                getAccountName={getAccountName}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleEnabled={toggleEnabled}
              />
            )}
          </Stack>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
