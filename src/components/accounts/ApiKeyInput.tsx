import { useState } from 'react';
import { TextInput, PasswordInput, ActionIcon, Group, CopyButton, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  isSecret?: boolean;
  disabled?: boolean;
}

export function ApiKeyInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  isSecret = false,
  disabled = false,
}: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);

  const InputComponent = isSecret ? PasswordInput : TextInput;

  return (
    <Group gap="xs" align="flex-end" w="100%">
      <InputComponent
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        required={required}
        error={error}
        disabled={disabled}
        visible={visible}
        onVisibilityChange={setVisible}
        style={{ flex: 1 }}
      />
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow>
            <ActionIcon
              color={copied ? 'teal' : 'gray'}
              variant="subtle"
              onClick={copy}
              disabled={!value || disabled}
              size="lg"
            >
              {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}
