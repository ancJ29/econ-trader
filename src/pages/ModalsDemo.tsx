import { Stack, Title, Text, Paper, Button, Group, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

export default function ModalsDemo() {
  const openBasicModal = () => {
    modals.open({
      title: 'Basic Modal',
      children: (
        <Stack gap="md">
          <Text>This is a basic modal with some content.</Text>
          <Text size="sm" c="dimmed">
            Click outside or press ESC to close.
          </Text>
        </Stack>
      ),
    });
  };

  const openConfirmModal = () => {
    modals.openConfirmModal({
      title: 'Delete Item',
      children: (
        <Text size="sm">
          Are you sure you want to delete this item? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        notifications.show({
          title: 'Deleted',
          message: 'Item was deleted successfully',
          color: 'red',
        }),
    });
  };

  const openFormModal = () => {
    modals.open({
      title: 'Form Modal',
      children: (
        <Stack gap="md">
          <TextInput label="Name" placeholder="Your name" data-autofocus />
          <TextInput label="Email" placeholder="your@email.com" />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => modals.closeAll()}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Form submitted!',
                  color: 'green',
                });
                modals.closeAll();
              }}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  const openNestedModal = () => {
    modals.open({
      title: 'First Modal',
      children: (
        <Stack gap="md">
          <Text>This is the first modal.</Text>
          <Button
            onClick={() => {
              modals.open({
                title: 'Second Modal',
                children: (
                  <Stack gap="md">
                    <Text>This is a nested modal!</Text>
                    <Button onClick={() => modals.closeAll()}>Close All</Button>
                  </Stack>
                ),
              });
            }}
          >
            Open Nested Modal
          </Button>
        </Stack>
      ),
    });
  };

  return (
    <Stack gap="lg" py="xl">
      <div>
        <Title order={1} mb="xs">
          Modals Demo
        </Title>
        <Text c="dimmed">Modal dialogs and confirmations with @mantine/modals</Text>
      </div>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Basic Modal
          </Title>
          <Text size="sm" c="dimmed">
            Simple modal with custom content
          </Text>
          <Button onClick={openBasicModal}>Open Modal</Button>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Confirm Modal
          </Title>
          <Text size="sm" c="dimmed">
            Confirmation dialog with callbacks
          </Text>
          <Button onClick={openConfirmModal} color="red">
            Open Confirm Modal
          </Button>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Form Modal
          </Title>
          <Text size="sm" c="dimmed">
            Modal with form inputs
          </Text>
          <Button onClick={openFormModal}>Open Form Modal</Button>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Nested Modals
          </Title>
          <Text size="sm" c="dimmed">
            Open modals within modals
          </Text>
          <Button onClick={openNestedModal}>Open Nested Modal</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
