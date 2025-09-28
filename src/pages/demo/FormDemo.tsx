import {
  Stack,
  Title,
  Text,
  Paper,
  TextInput,
  Button,
  Group,
  NumberInput,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function FormDemo() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      age: undefined,
      termsOfService: false,
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      age: (value) => (value && value < 18 ? 'You must be at least 18 years old' : null),
      termsOfService: (value) => (!value ? 'You must accept terms of service' : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    notifications.show({
      title: 'Form submitted!',
      message: `Welcome, ${values.name}!`,
      color: 'green',
    });
    console.log('Form values:', values);
  });

  return (
    <Stack gap="lg" py="xl">
      <div>
        <Title order={1} mb="xs">
          Form Demo
        </Title>
        <Text c="dimmed">Form validation and state management with @mantine/form</Text>
      </div>

      <Paper shadow="xs" p="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput label="Name" placeholder="Your name" {...form.getInputProps('name')} />

            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps('email')}
            />

            <NumberInput
              label="Age"
              placeholder="Your age"
              min={0}
              max={120}
              {...form.getInputProps('age')}
            />

            <Checkbox
              label="I accept terms and conditions"
              {...form.getInputProps('termsOfService', { type: 'checkbox' })}
            />

            <Group justify="flex-end" mt="md">
              <Button type="button" variant="light" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
