import { Text } from '@mantine/core';

interface FlagProps {
  countryCode: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return countryCode;
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

export function Flag({ countryCode, size = 'lg' }: FlagProps) {
  const flag = getCountryFlag(countryCode);

  return (
    <Text component="span" size={size} style={{ lineHeight: 1 }}>
      {flag}
    </Text>
  );
}
