import { Group, Title, ActionIcon, Box, Container, Tooltip, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { Flag } from '@/components/common/Flag';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', countryCode: 'US' },
  { value: 'ja', label: '日本語', countryCode: 'JP' },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleTheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

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
            <Tooltip label={`${t('theme')}: ${t(computedColorScheme)}`}>
              <ActionIcon onClick={toggleTheme} variant="light" size="lg">
                {computedColorScheme === 'dark' ? '☀️' : '🌙'}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
