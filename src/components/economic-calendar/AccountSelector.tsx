import { useAccountStore } from '@/store/accountStore';
import type { Account } from '@/types/account';
import { Select } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

  // Auto-select first active account if none selected, fallback to first account
  useEffect(() => {
    if (!value && accounts.length > 0 && !isLoading) {
      const activeAccounts = accounts.filter((a) => a.isActive);
      const accountToSelect = activeAccounts.length > 0 ? activeAccounts[0] : accounts[0];
      onChange(accountToSelect.id, accountToSelect);
    }
  }, [accounts, value, onChange, isLoading]);

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} (${account.exchange})${!account.isActive ? ` [${t('inactive')}]` : ''}`,
    disabled: false,
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
