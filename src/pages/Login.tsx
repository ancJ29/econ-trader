import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Alert,
} from '@mantine/core';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthStore } from '@/store/authStore';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation
    if (!email || !password) {
      setFormError(t('auth.errors.fillAllFields'));
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  const displayError = formError || error;

  return (
    <Stack gap="lg" py="xl" w={isMobile ? '90vw' : '80vw'}>
      <Box
        style={{
          maxWidth: 480,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Title ta="center" order={1}>
          {t('auth.login.title')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('auth.login.noAccount')}{' '}
          <Anchor component={Link} to="/register" size="sm">
            {t('auth.login.createAccount')}
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {displayError && (
                <Alert color="red" title={t('auth.errors.title')}>
                  {displayError}
                </Alert>
              )}

              <TextInput
                label={t('auth.fields.email')}
                placeholder={t('auth.placeholders.email')}
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                type="email"
              />

              <PasswordInput
                label={t('auth.fields.password')}
                placeholder={t('auth.placeholders.password')}
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />

              <Button type="submit" fullWidth loading={isLoading}>
                {t('auth.login.submit')}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Login;
