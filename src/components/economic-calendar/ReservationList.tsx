import type { Reservation } from '@/services/reservation';
import { Stack } from '@mantine/core';
import { ReservationCard } from './ReservationCard';

interface ReservationListProps {
  reservations: Reservation[];
  getAccountName: (accountId: string) => string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  updatingId: string | null;
}

export function ReservationList({
  reservations,
  getAccountName,
  onEdit,
  onDelete,
  onToggleEnabled,
  updatingId,
}: ReservationListProps) {
  return (
    <Stack gap="md">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          getAccountName={getAccountName}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleEnabled={onToggleEnabled}
          isToggling={updatingId === reservation.id}
        />
      ))}
    </Stack>
  );
}
