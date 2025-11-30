import { Select } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface SymbolSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  availableSymbols: string[] | undefined;
  disabled?: boolean;
  error?: string;
}

export function SymbolSelector({
  value,
  onChange,
  availableSymbols,
  disabled,
  error,
}: SymbolSelectorProps) {
  const { t } = useTranslation();

  const instrumentOptions = useMemo(() => {
    return (
      availableSymbols?.map((symbol) => ({
        value: symbol,
        label: symbol,
      })) || []
    );
  }, [availableSymbols]);

  // Auto-select first symbol if none selected
  useEffect(() => {
    if (!value && instrumentOptions.length > 0) {
      onChange(instrumentOptions[0].value as string);
    }
  }, [instrumentOptions, value, onChange]);

  return (
    <Select
      label={t('action.selectInstrument')}
      placeholder={t('action.selectInstrumentPlaceholder')}
      data={instrumentOptions}
      value={value}
      onChange={(val) => onChange(val as string | null)}
      disabled={disabled || instrumentOptions.length === 0}
      error={error}
      searchable
      nothingFoundMessage={t('action.noInstrumentsAvailable')}
    />
  );
}
