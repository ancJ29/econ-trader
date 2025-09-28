import { useState } from 'react';
import { Stack, Title, Text, Paper } from '@mantine/core';
import { DatePicker, DateTimePicker } from '@mantine/dates';

export default function DatesDemo() {
  const [value, setValue] = useState<string | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState<string | null>(null);
  const [rangeValue, setRangeValue] = useState<[string | null, string | null]>([null, null]);

  return (
    <Stack gap="lg" py="xl">
      <div>
        <Title order={1} mb="xs">
          Dates Demo
        </Title>
        <Text c="dimmed">Examples of date pickers and date inputs from @mantine/dates</Text>
      </div>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Date Picker
          </Title>
          <DatePicker value={value} onChange={setValue} />
          {value && <Text size="sm">Selected: {new Date(value).toDateString()}</Text>}
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Date Time Picker
          </Title>
          <DateTimePicker
            value={dateTimeValue}
            onChange={setDateTimeValue}
            placeholder="Pick date and time"
            label="Event Date"
          />
          {dateTimeValue && (
            <Text size="sm">Selected: {new Date(dateTimeValue).toLocaleString()}</Text>
          )}
        </Stack>
      </Paper>

      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3} size="h4">
            Date Range Picker
          </Title>
          <DatePicker type="range" value={rangeValue} onChange={setRangeValue} />
          {rangeValue[0] && rangeValue[1] && (
            <Text size="sm">
              Range: {new Date(rangeValue[0]).toDateString()} -{' '}
              {new Date(rangeValue[1]).toDateString()}
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
