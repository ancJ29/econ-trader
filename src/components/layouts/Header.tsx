import { Flag } from '@/components/common/Flag';
import { useAuthStore } from '@/store/authStore';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Container,
  Group,
  Menu,
  Select,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', countryCode: 'US' },
  // { value: 'ja', label: '日本語', countryCode: 'JP' },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const toggleTheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
            {isAuthenticated && (
              <Button
                component={Link}
                to="/reservations"
                variant={isActive('/reservations') ? 'filled' : 'subtle'}
                size="sm"
              >
                {t('economicCalendars.myReservations')}
              </Button>
            )}
          </Group>

          <Group gap="sm">
            {LANGUAGE_OPTIONS.length > 1 ? (
              <Select
                value={i18n.language}
                onChange={(value) => value && i18n.changeLanguage(value)}
                data={LANGUAGE_OPTIONS}
                leftSection={
                  <Flag
                    countryCode={
                      LANGUAGE_OPTIONS.find((opt) => opt.value === i18n.language)?.countryCode ||
                      'US'
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
            ) : null}

            {isAuthenticated ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="light" size="lg">
                    <Avatar size="sm" radius="xl">
                      <IconUser size={16} />
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{t('auth.menu.account')}</Menu.Label>
                  <Menu.Item leftSection={<IconUserCircle size={14} />}>
                    {t('auth.menu.profile')}
                  </Menu.Item>
                  <Menu.Item leftSection={<IconSettings size={14} />}>
                    {t('auth.menu.settings')}
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      colorScheme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />
                    }
                    onClick={toggleTheme}
                  >
                    {t('theme')}: {t(colorScheme === 'dark' ? 'dark' : 'light')}
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                    color="red"
                  >
                    {t('auth.logout')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs">
                <Button component={Link} to="/login" variant="subtle" size="sm">
                  {t('auth.login.submit')}
                </Button>
                <Button component={Link} to="/register" variant="filled" size="sm">
                  {t('auth.register.submit')}
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
