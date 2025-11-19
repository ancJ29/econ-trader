import { useIsMobile } from '@/hooks/useIsMobile';
import type { Account } from '@/services/account';
import { useAccountStore } from '@/store/accountStore';
import type { AccountFormData, TradingExchange } from '@/types/account';
import { Alert, Button, Drawer, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiKeyInput } from './ApiKeyInput';

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
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!account;

  useEffect(() => {
    if (opened) {
      if (account) {
        setName(account.name);
        setExchange(account.exchange);
        setApiKey(account.apiKey);
        setSecretKey('');
      } else {
        setName('');
        setExchange('Binance');
        setApiKey('');
        setSecretKey('');
      }
      setFormError(null);
    }
  }, [opened, account]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError(t('accountNameRequired'));
      return;
    }

    // In edit mode, only validate name
    if (!isEditMode) {
      if (!apiKey.trim()) {
        setFormError(t('apiKeyRequired'));
        return;
      }
    }

    setFormError(null);

    try {
      if (isEditMode && account) {
        // In edit mode, only update name
        await updateAccount(account.id, { name: name.trim() });
      } else {
        // In create mode, send all fields
        const formData: AccountFormData = {
          name: name.trim(),
          exchange,
          apiKey: apiKey.trim(),
          ...(secretKey && { secretKey: secretKey.trim() }),
        };
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
          disabled={isEditMode}
        />

        <ApiKeyInput
          label={t('apiKey')}
          placeholder={t('apiKeyPlaceholder')}
          value={apiKey}
          onChange={setApiKey}
          required
          disabled={isEditMode}
        />

        <ApiKeyInput
          label={t('secretKey')}
          placeholder={isEditMode ? t('secretKeyEditPlaceholder') : t('secretKeyPlaceholder')}
          value={secretKey}
          onChange={setSecretKey}
          isSecret
          required={!isEditMode}
          disabled={isEditMode}
        />

        <Text size="xs" c="blue" fw={600} style={{ fontStyle: 'italic' }} w="100%" ta="right">
          {t('ipInformation', { ip: import.meta.env.VITE_STATIC_IP })}
        </Text>

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
