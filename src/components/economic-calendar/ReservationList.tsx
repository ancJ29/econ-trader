import { Stack } from '@mantine/core';
import { ReservationCard } from './ReservationCard';
import type { Reservation } from '@/services/reservation';

interface ReservationListProps {
  reservations: Reservation[];
  getAccountName: (accountId: string) => string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

export function ReservationList({
  reservations,
  getAccountName,
  onEdit,
  onDelete,
  onToggleEnabled,
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
        />
      ))}
    </Stack>
  );
}
