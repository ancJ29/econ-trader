import { Link } from 'react-router-dom';
import { Stack, Title, Card, Text, Button, Grid } from '@mantine/core';

const demos = [
  {
    title: 'Dates Demo',
    description: 'Date pickers, calendars, and date range selectors',
    path: '/demos/dates',
  },
  {
    title: 'Form Demo',
    description: 'Form validation, state management, and form utilities',
    path: '/demos/form',
  },
  {
    title: 'Hooks Demo',
    description: 'Useful React hooks for common patterns',
    path: '/demos/hooks',
  },
  {
    title: 'Modals Demo',
    description: 'Modal dialogs, confirmations, and context modals',
    path: '/demos/modals',
  },
  {
    title: 'Notifications Demo',
    description: 'Toast notifications and alerts',
    path: '/demos/notifications',
  },
];

export default function DemoHome() {
  return (
    <Stack gap="lg" py="xl">
      <Title order={1}>Mantine Demos</Title>
      <Text c="dimmed">Explore various Mantine packages and their features</Text>

      <Grid>
        {demos.map((demo) => (
          <Grid.Col key={demo.path} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack gap="md" h="100%" justify="space-between">
                <div>
                  <Title order={3} size="h4" mb="xs">
                    {demo.title}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {demo.description}
                  </Text>
                </div>
                <Button component={Link} to={demo.path} variant="light" fullWidth>
                  View Demo
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
