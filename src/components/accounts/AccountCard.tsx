import { Card, Stack, Group, Text, Badge, Button, Menu, ActionIcon } from '@mantine/core';
import { IconDots, IconEdit, IconTrash, IconPower } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Account } from '@/services/account';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete, onToggleStatus }: AccountCardProps) {
  const { t } = useTranslation();

  const getMarketCount = () => {
    return Object.keys(account.availableMarkets || {}).length;
  };

  return (
    <Card padding="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="xs">
              <Text fw={600} size="lg">
                {account.name}
              </Text>
              <Badge color={account.isActive ? 'green' : 'gray'} size="sm">
                {account.isActive ? t('active') : t('inactive')}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {account.exchange}
            </Text>
          </Stack>

          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => onEdit(account)}>
                {t('action.edit')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconPower size={16} />}
                onClick={() => onToggleStatus(account)}
              >
                {account.isActive ? t('deactivate') : t('activate')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => onDelete(account)}
              >
                {t('action.delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="lg">
          <div>
            <Text size="xs" c="dimmed">
              {t('markets')}
            </Text>
            <Text size="sm" fw={500}>
              {getMarketCount()}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              {t('apiKey')}
            </Text>
            <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
              {account.apiKey.substring(0, 16)}...
            </Text>
          </div>
        </Group>

        <Button component={Link} to={`/accounts/${account.id}`} variant="light" fullWidth size="sm">
          {t('viewDetails')}
        </Button>
      </Stack>
    </Card>
  );
}
