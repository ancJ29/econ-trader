import { Select } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/store/accountStore';
import type { Account } from '@/types/account';

interface AccountSelectorProps {
  value: string | null;
  onChange: (value: string | null, account: Account | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export function AccountSelector({ value, onChange, disabled, error }: AccountSelectorProps) {
  const { t } = useTranslation();
  const { accounts, isLoading, fetchAccounts } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Auto-select first active account if none selected
  useEffect(() => {
    if (!value && accounts.length > 0 && !isLoading) {
      const activeAccounts = accounts.filter((a) => a.isActive);
      if (activeAccounts.length > 0) {
        onChange(activeAccounts[0].id, activeAccounts[0]);
      }
    }
  }, [accounts, value, onChange, isLoading]);

  const accountOptions = accounts
    .filter((account) => account.isActive)
    .map((account) => ({
      value: account.id,
      label: `${account.name} (${account.exchange})`,
      disabled: !account.isActive,
    }));

  const handleChange = (accountId: string | null) => {
    const account = accounts.find((a) => a.id === accountId);
    onChange(accountId, account);
  };

  return (
    <Select
      label={t('action.selectAccount')}
      placeholder={t('action.selectAccountPlaceholder')}
      data={accountOptions}
      value={value}
      onChange={handleChange}
      disabled={disabled || isLoading}
      error={error}
      searchable
      nothingFoundMessage={t('action.noActiveAccounts')}
    />
  );
}
