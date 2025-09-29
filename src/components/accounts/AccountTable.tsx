import { Table, Badge, ActionIcon, Group, Tooltip, Anchor } from '@mantine/core';
import { IconEdit, IconTrash, IconPower } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Account } from '@/services/account';

interface AccountTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
}

export function AccountTable({ accounts, onEdit, onDelete, onToggleStatus }: AccountTableProps) {
  const { t } = useTranslation();

  const getMarketCount = (account: Account) => {
    return Object.keys(account.availableMarkets || {}).length;
  };

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('accountName')}</Table.Th>
          <Table.Th>{t('exchange')}</Table.Th>
          <Table.Th>{t('status')}</Table.Th>
          <Table.Th>{t('markets')}</Table.Th>
          <Table.Th>{t('apiKey')}</Table.Th>
          <Table.Th style={{ width: 120 }}>{t('actions')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {accounts.map((account) => (
          <Table.Tr key={account.id}>
            <Table.Td>
              <Anchor component={Link} to={`/accounts/${account.id}`} fw={500}>
                {account.name}
              </Anchor>
            </Table.Td>
            <Table.Td>{account.exchange}</Table.Td>
            <Table.Td>
              <Badge color={account.isActive ? 'green' : 'gray'} size="sm">
                {account.isActive ? t('active') : t('inactive')}
              </Badge>
            </Table.Td>
            <Table.Td>{getMarketCount(account)}</Table.Td>
            <Table.Td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {account.apiKey.substring(0, 20)}...
            </Table.Td>
            <Table.Td>
              <Group gap="xs" wrap="nowrap">
                <Tooltip label={t('action.edit')}>
                  <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(account)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={account.isActive ? t('deactivate') : t('activate')}>
                  <ActionIcon
                    variant="subtle"
                    color="yellow"
                    onClick={() => onToggleStatus(account)}
                  >
                    <IconPower size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('action.delete')}>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(account)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
