import { Title, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <Stack gap="lg" py="xl">
      <Title order={1}>{t('welcomeToEconTrader')}</Title>
    </Stack>
  );
}

export default Home;
