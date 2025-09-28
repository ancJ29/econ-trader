import { Link } from 'react-router-dom';
import { Title, Text, Button, Stack, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useCounterStore } from '../store/counterStore';

function Home() {
  const { t, i18n } = useTranslation();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const { count, increment, decrement } = useCounterStore();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Stack gap="lg" py="xl">
      <Group justify="flex-end">
        <Button onClick={toggleLanguage} variant="light" size="sm">
          {t('language')}: {i18n.language.toUpperCase()}
        </Button>
        <Button onClick={toggleTheme} variant="light" size="sm">
          {t('theme')}: {t(computedColorScheme)}
        </Button>
      </Group>

      <Title order={1}>{t('welcomeToEconTrader')}</Title>

      <div>
        <Text size="lg" mb="md">
          {t('counter')}: {count}
        </Text>
        <Group>
          <Button onClick={increment}>{t('increment')}</Button>
          <Button onClick={decrement}>{t('decrement')}</Button>
        </Group>
      </div>

      <div>
        <Text size="sm" c="dimmed" mb="sm">
          {t('checkOutDemos')}
        </Text>
        <Button component={Link} to="/demos" variant="light">
          {t('viewDemos')}
        </Button>
      </div>
    </Stack>
  );
}

export default Home;
