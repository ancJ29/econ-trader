import { useAuthStore } from '@/store/authStore';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { register, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation
    if (!email || !password || !confirmPassword) {
      setFormError(t('auth.errors.fillAllFields'));
      return;
    }

    if (password.length < 8) {
      setFormError(t('auth.errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t('auth.errors.passwordMismatch'));
      return;
    }

    const success = await register(email, password);
    if (success) {
      navigate('/login');
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
          {t('auth.register.title')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('auth.register.haveAccount')}{' '}
          <Anchor component={Link} to="/login" size="sm">
            {t('auth.register.signIn')}
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

              <PasswordInput
                label={t('auth.fields.confirmPassword')}
                placeholder={t('auth.placeholders.confirmPassword')}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              />

              <Button type="submit" fullWidth loading={isLoading}>
                {t('auth.register.submit')}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Register;
