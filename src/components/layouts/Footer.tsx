import { Group, Text, Box, Anchor, Divider, Container } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box component="footer" mt="xl" py="lg" style={{ width: '100%' }}>
      <Container size="xl">
        <Divider mb="md" />
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="sm" fw={600} mb="xs">
              {t('footerAbout')}
            </Text>
            <Text size="xs" c="dimmed" style={{ maxWidth: 300 }}>
              {t('footerDescription')}
            </Text>
          </Box>

          <Box>
            <Text size="sm" fw={600} mb="xs">
              {t('footerLinks')}
            </Text>
            <Group gap="xs" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Anchor href="#" size="xs" c="dimmed">
                {t('footerHome')}
              </Anchor>
              <Anchor href="#" size="xs" c="dimmed">
                {t('footerEconomicCalendar')}
              </Anchor>
              <Anchor href="#" size="xs" c="dimmed">
                {t('footerDemos')}
              </Anchor>
            </Group>
          </Box>

          <Box>
            <Text size="sm" fw={600} mb="xs">
              {t('footerContact')}
            </Text>
            <Text size="xs" c="dimmed">
              info@econtrader.com
            </Text>
          </Box>
        </Group>

        <Divider mt="md" mb="xs" />
        <Text size="xs" c="dimmed" ta="center">
          {t('footerCopyright', { year: new Date().getFullYear() })}
        </Text>
      </Container>
    </Box>
  );
};
