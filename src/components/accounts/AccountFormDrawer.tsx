import { useEffect, useState } from 'react';
import {
  Drawer,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Alert,
  Checkbox,
  Title,
  Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ApiKeyInput } from './ApiKeyInput';
import { useAccountStore } from '@/store/accountStore';
import type { Account, AccountFormData } from '@/services/account';
import type { TradingExchange } from '@/types/account';

interface AccountFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  account?: Account | null;
}

const EXCHANGE_OPTIONS = [
  { value: 'Binance', label: 'Binance' },
  { value: 'Bybit', label: 'Bybit' },
] as const;

export function AccountFormDrawer({ opened, onClose, account }: AccountFormDrawerProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { createAccount, updateAccount, isLoading, error } = useAccountStore();

  const [name, setName] = useState('');
  const [exchange, setExchange] = useState<TradingExchange>('Binance');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [secretKeySaved, setSecretKeySaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!account;

  useEffect(() => {
    if (opened) {
      if (account) {
        setName(account.name);
        setExchange(account.exchange);
        setApiKey(account.apiKey);
        setSecretKey('');
        setSecretKeySaved(true);
      } else {
        setName('');
        setExchange('Binance');
        setApiKey('');
        setSecretKey('');
        setSecretKeySaved(false);
      }
      setFormError(null);
    }
  }, [opened, account]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError(t('accountNameRequired'));
      return;
    }

    if (!apiKey.trim()) {
      setFormError(t('apiKeyRequired'));
      return;
    }

    if (!isEditMode && !secretKeySaved) {
      setFormError(t('mustConfirmSecretKeySaved'));
      return;
    }

    setFormError(null);

    try {
      const formData: AccountFormData = {
        name: name.trim(),
        exchange,
        apiKey: apiKey.trim(),
        ...(secretKey && { secretKey: secretKey.trim() }),
      };

      if (isEditMode && account) {
        await updateAccount(account.id, formData);
      } else {
        await createAccount(formData);
      }
      onClose();
    } catch (_err) {
      setFormError(error || t('account.operationFailed'));
    }
  };

  return (
    <Drawer
      styles={{
        content: isMobile
          ? {
              borderRadius: 'var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0',
            }
          : undefined,
      }}
      opened={opened}
      onClose={onClose}
      withCloseButton={true}
      position={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '95vh' : 'md'}
      title={
        <Stack gap="xs">
          <Title order={3}>{isEditMode ? t('editAccount') : t('addAccount')}</Title>
          {account && (
            <Text size="sm" c="dimmed">
              {account.name}
            </Text>
          )}
        </Stack>
      }
    >
      <Stack gap="md">
        {!isEditMode && (
          <Alert icon={<IconAlertCircle size={16} />} title={t('securityWarning')} color="yellow">
            {t('secretKeyWarning')}
          </Alert>
        )}

        {(formError || error) && (
          <Alert icon={<IconAlertCircle size={16} />} title={t('error')} color="red">
            {formError || error}
          </Alert>
        )}

        <TextInput
          label={t('accountName')}
          placeholder={t('accountNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Select
          label={t('exchange')}
          placeholder={t('selectExchange')}
          value={exchange}
          onChange={(value) => setExchange((value as TradingExchange) || 'Binance')}
          data={EXCHANGE_OPTIONS}
          required
        />

        <ApiKeyInput
          label={t('apiKey')}
          placeholder={t('apiKeyPlaceholder')}
          value={apiKey}
          onChange={setApiKey}
          required
        />

        <ApiKeyInput
          label={t('secretKey')}
          placeholder={isEditMode ? t('secretKeyEditPlaceholder') : t('secretKeyPlaceholder')}
          value={secretKey}
          onChange={setSecretKey}
          isSecret
          required={!isEditMode}
        />

        {!isEditMode && (
          <Checkbox
            label={t('confirmSecretKeySaved')}
            checked={secretKeySaved}
            onChange={(e) => setSecretKeySaved(e.currentTarget.checked)}
          />
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            {t('action.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {isEditMode ? t('action.save') : t('action.create')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
