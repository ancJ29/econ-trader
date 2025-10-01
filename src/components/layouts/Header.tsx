import { Group, Title, ActionIcon, Box, Container, Tooltip, Select, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMantineColorScheme } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { Flag } from '@/components/common/Flag';
import { IconMoon, IconSun } from '@tabler/icons-react';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', countryCode: 'US' },
  { value: 'ja', label: '日本語', countryCode: 'JP' },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const location = useLocation();

  const toggleTheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box component="header" py="md" mb="lg" style={{ width: '100%' }}>
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Box
              component="div"
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #13956f 0%, #B89350 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              ET
            </Box>
            <Title order={3}>{t('econTrader')}</Title>
          </Group>

          <Group gap="xs">
            <Button component={Link} to="/" variant={isActive('/') ? 'filled' : 'subtle'} size="sm">
              {t('home')}
            </Button>
            <Button
              component={Link}
              to="/economic-calendar"
              variant={isActive('/economic-calendar') ? 'filled' : 'subtle'}
              size="sm"
            >
              {t('economicCalendar')}
            </Button>
            <Button
              component={Link}
              to="/accounts"
              variant={isActive('/accounts') ? 'filled' : 'subtle'}
              size="sm"
            >
              {t('account.list')}
            </Button>
          </Group>

          <Group gap="sm">
            <Select
              value={i18n.language}
              onChange={(value) => value && i18n.changeLanguage(value)}
              data={LANGUAGE_OPTIONS}
              leftSection={
                <Flag
                  countryCode={
                    LANGUAGE_OPTIONS.find((opt) => opt.value === i18n.language)?.countryCode || 'US'
                  }
                  size="sm"
                />
              }
              renderOption={({ option }) => {
                const lang = LANGUAGE_OPTIONS.find((opt) => opt.value === option.value);
                return (
                  <Group gap="xs">
                    <Flag countryCode={lang?.countryCode || 'US'} size="sm" />
                    <span>{option.label}</span>
                  </Group>
                );
              }}
              styles={{ input: { width: 140 } }}
              comboboxProps={{ withinPortal: false }}
            />
            <Tooltip label={`${t('theme')}: ${t(colorScheme === 'dark' ? 'dark' : 'light')}`}>
              <ActionIcon onClick={toggleTheme} variant="light" size="lg">
                {colorScheme === 'dark' ? <IconSun /> : <IconMoon />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
