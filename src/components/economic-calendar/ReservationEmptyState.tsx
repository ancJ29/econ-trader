import { Card, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function ReservationEmptyState() {
  const { t } = useTranslation();

  return (
    <Card withBorder p="xl">
      <Stack align="center" gap="md">
        <Text c="dimmed">{t('economicCalendars.noReservations')}</Text>
      </Stack>
    </Card>
  );
}
