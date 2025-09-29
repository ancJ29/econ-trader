import { useEffect, useState } from 'react';
import { Title, Stack, Alert, Button, Group, Text, Modal, SimpleGrid } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/store/accountStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountTable } from '@/components/accounts/AccountTable';
import { AccountFormDrawer } from '@/components/accounts/AccountFormDrawer';
import type { Account } from '@/services/account';

function Accounts() {
  const { t } = useTranslation();
  const { accounts, fetchAccounts, deleteAccount, toggleAccountStatus, isLoading, error } =
    useAccountStore();
  const isMobile = useIsMobile();

  const [formModalOpened, setFormModalOpened] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setFormModalOpened(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setFormModalOpened(true);
  };

  const handleDeleteAccount = (account: Account) => {
    setAccountToDelete(account);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        setDeleteModalOpened(false);
        setAccountToDelete(null);
      } catch (err) {
        console.error('Failed to delete account:', err);
      }
    }
  };

  const handleToggleStatus = async (account: Account) => {
    try {
      await toggleAccountStatus(account.id);
    } catch (err) {
      console.error('Failed to toggle account status:', err);
    }
  };

  if (isLoading && accounts.length === 0) {
    return <LoadingOverlay visible={true} message={t('loading')} />;
  }

  return (
    <Stack gap="lg" py="xl" w={isMobile ? '90vw' : '80vw'}>
      <Group justify="space-between" align="center">
        <Title order={1}>{t('accounts')}</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={handleAddAccount}>
          {t('addAccount')}
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title={t('error')} color="red">
          {error}
        </Alert>
      )}

      {!isLoading && accounts.length === 0 && (
        <Alert icon={<IconAlertCircle size={16} />} title={t('noAccounts')} color="blue">
          <Stack gap="sm">
            <Text>{t('noAccountsMessage')}</Text>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAddAccount}
              style={{ alignSelf: 'flex-start' }}
            >
              {t('addFirstAccount')}
            </Button>
          </Stack>
        </Alert>
      )}

      {accounts.length > 0 && (
        <>
          {isMobile ? (
            <SimpleGrid cols={1} spacing="md">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </SimpleGrid>
          ) : (
            <AccountTable
              accounts={accounts}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </>
      )}

      <AccountFormDrawer
        opened={formModalOpened}
        onClose={() => {
          setFormModalOpened(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
      />

      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setAccountToDelete(null);
        }}
        title={t('confirmDelete')}
      >
        <Stack gap="md">
          <Text>{t('confirmDeleteMessage', { accountName: accountToDelete?.name || '' })}</Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setDeleteModalOpened(false);
                setAccountToDelete(null);
              }}
            >
              {t('action.cancel')}
            </Button>
            <Button color="red" onClick={confirmDelete}>
              {t('action.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default Accounts;
