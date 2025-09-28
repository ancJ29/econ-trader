import { Stack, Title, Text, Paper, Button, Group, Code, Badge } from '@mantine/core';
import {
  useClipboard,
  useToggle,
  useDisclosure,
  useCounter,
  useLocalStorage,
} from '@mantine/hooks';

export default function HooksDemo() {
  const clipboard = useClipboard({ timeout: 1000 });
  const [value, toggle] = useToggle(['light', 'dark']);
  const [opened, { open, close, toggle: toggleDisclosure }] = useDisclosure(false);
  const [count, handlers] = useCounter(0, { min: 0, max: 10 });
  const [storageValue, setStorageValue] = useLocalStorage({
    key: 'demo-value',
    defaultValue: 'Hello from localStorage',
  });

  return (
    <Stack gap="lg" py="xl">
      <div>
        <Title order={1} mb="xs">
          Hooks Demo
        </Title>
        <Text c="dimmed">Useful React hooks from @mantine/hooks</Text>
      </div>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            useClipboard
          </Title>
          <Group>
            <Button
              onClick={() => clipboard.copy('Text to copy')}
              color={clipboard.copied ? 'green' : 'blue'}
            >
              {clipboard.copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            useToggle
          </Title>
          <Group>
            <Badge size="lg" variant="light">
              Current: {value}
            </Badge>
            <Button onClick={() => toggle()}>Toggle Theme</Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            useDisclosure
          </Title>
          <Group>
            <Badge size="lg" variant="light">
              Status: {opened ? 'Open' : 'Closed'}
            </Badge>
            <Button onClick={open}>Open</Button>
            <Button onClick={close} variant="light">
              Close
            </Button>
            <Button onClick={toggleDisclosure} variant="outline">
              Toggle
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            useCounter
          </Title>
          <Group>
            <Badge size="lg" variant="light">
              Count: {count}
            </Badge>
            <Button onClick={handlers.increment}>Increment</Button>
            <Button onClick={handlers.decrement} variant="light">
              Decrement
            </Button>
            <Button onClick={handlers.reset} variant="outline">
              Reset
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            useLocalStorage
          </Title>
          <Code block>{storageValue}</Code>
          <Group>
            <Button onClick={() => setStorageValue('Updated value!')}>Update Value</Button>
            <Button onClick={() => setStorageValue('Hello from localStorage')} variant="light">
              Reset Value
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
