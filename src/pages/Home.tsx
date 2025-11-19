import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Card,
  SimpleGrid,
  Container,
  Center,
  Box,
  useMantineColorScheme,
} from '@mantine/core';
import { IconCalendar, IconWallet, IconArrowRight } from '@tabler/icons-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthStore } from '@/store/authStore';

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { colorScheme } = useMantineColorScheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isDark = colorScheme === 'dark';

  const features = [
    {
      icon: IconCalendar,
      title: t('homePage.features.economicCalendar.title'),
      description: t('homePage.features.economicCalendar.description'),
      action: t('homePage.features.economicCalendar.explore'),
      path: '/economic-calendar',
      gradient: 'linear-gradient(135deg, #13956f 0%, #32c991 100%)',
    },
    {
      icon: IconWallet,
      title: t('homePage.features.accountManagement.title'),
      description: t('homePage.features.accountManagement.description'),
      action: t('homePage.features.accountManagement.explore'),
      path: '/accounts',
      gradient: 'linear-gradient(135deg, #B89350 0%, #e9b63a 100%)',
      requireAuth: true,
    },
  ];

  const handleFeatureClick = (path: string, requireAuth?: boolean) => {
    if (requireAuth && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <Container size="lg" py={isMobile ? 'xl' : 80}>
      <Stack gap={isMobile ? 60 : 80}>
        {/* Hero Section */}
        <Center>
          <Stack gap="lg" align="center" maw={800} ta="center">
            <Title
              order={1}
              size={isMobile ? 36 : 48}
              fw={700}
              style={{
                background: 'linear-gradient(135deg, #13956f 0%, #32c991 50%, #B89350 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('homePage.title')}
            </Title>

            <Title order={2} size={isMobile ? 20 : 24} fw={500} c={isDark ? 'gray.3' : 'gray.7'}>
              {t('homePage.subtitle')}
            </Title>

            <Text size={isMobile ? 'sm' : 'md'} c={isDark ? 'gray.5' : 'gray.6'} maw={600}>
              {t('homePage.description')}
            </Text>

            <Group gap="md" mt="md">
              <Button
                size={isMobile ? 'md' : 'lg'}
                variant="gradient"
                gradient={{ from: '#13956f', to: '#32c991', deg: 135 }}
                rightSection={<IconArrowRight size={18} />}
                onClick={() => navigate('/economic-calendar')}
              >
                {t('homePage.cta.getStarted')}
              </Button>

              {!isAuthenticated && (
                <Button
                  size={isMobile ? 'md' : 'lg'}
                  variant="outline"
                  color="primary"
                  onClick={() => navigate('/login')}
                >
                  {t('homePage.cta.login')}
                </Button>
              )}
            </Group>
          </Stack>
        </Center>

        {/* Features Section */}
        <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? 'lg' : 'xl'}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                shadow="md"
                padding={isMobile ? 'lg' : 'xl'}
                radius="md"
                style={{
                  border: isDark ? '1px solid #2C2E33' : '1px solid #dee2e6',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                      : '0 8px 24px rgba(0, 0, 0, 0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 1px 3px rgba(0, 0, 0, 0.2)'
                      : '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onClick={() => handleFeatureClick(feature.path, feature.requireAuth)}
              >
                <Stack gap="md">
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={24} color="white" stroke={2} />
                  </Box>

                  <Stack gap="xs">
                    <Title order={3} size={isMobile ? 'h4' : 'h3'}>
                      {feature.title}
                    </Title>
                    <Text size={isMobile ? 'xs' : 'sm'} c={isDark ? 'gray.5' : 'gray.6'}>
                      {feature.description}
                    </Text>
                  </Stack>

                  <Group gap="xs" mt="auto">
                    <Text size="sm" fw={500} c="primary">
                      {feature.action}
                    </Text>
                    <IconArrowRight size={16} color="var(--mantine-color-primary-6)" />
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default Home;
