import { Stack, Title, Text, Paper, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function NotificationsDemo() {
  const showBasicNotification = () => {
    notifications.show({
      title: 'Basic Notification',
      message: 'This is a basic notification',
    });
  };

  const showSuccessNotification = () => {
    notifications.show({
      title: 'Success!',
      message: 'Your action was completed successfully',
      color: 'green',
    });
  };

  const showErrorNotification = () => {
    notifications.show({
      title: 'Error',
      message: 'Something went wrong, please try again',
      color: 'red',
    });
  };

  const showWarningNotification = () => {
    notifications.show({
      title: 'Warning',
      message: 'Please review your input',
      color: 'yellow',
    });
  };

  const showLoadingNotification = () => {
    const id = notifications.show({
      loading: true,
      title: 'Loading',
      message: 'Please wait...',
      autoClose: false,
    });

    setTimeout(() => {
      notifications.update({
        id,
        color: 'green',
        title: 'Complete',
        message: 'Operation finished successfully!',
        loading: false,
        autoClose: 3000,
      });
    }, 2000);
  };

  const showAutoCloseNotification = () => {
    notifications.show({
      title: 'Auto Close',
      message: 'This notification will close in 2 seconds',
      autoClose: 2000,
    });
  };

  const showPersistentNotification = () => {
    notifications.show({
      title: 'Persistent',
      message: 'Click the X button to close this notification',
      autoClose: false,
      withCloseButton: true,
    });
  };

  return (
    <Stack gap="lg" py="xl">
      <div>
        <Title order={1} mb="xs">
          Notifications Demo
        </Title>
        <Text c="dimmed">Toast notifications with @mantine/notifications</Text>
      </div>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Basic Notification
          </Title>
          <Button onClick={showBasicNotification}>Show Basic</Button>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Color Variants
          </Title>
          <Group>
            <Button onClick={showSuccessNotification} color="green">
              Success
            </Button>
            <Button onClick={showErrorNotification} color="red">
              Error
            </Button>
            <Button onClick={showWarningNotification} color="yellow">
              Warning
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Loading State
          </Title>
          <Text size="sm" c="dimmed">
            Show a loading notification that updates when complete
          </Text>
          <Button onClick={showLoadingNotification}>Show Loading</Button>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Auto Close
          </Title>
          <Group>
            <Button onClick={showAutoCloseNotification}>Auto Close (2s)</Button>
            <Button onClick={showPersistentNotification} variant="light">
              Persistent
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
