import { Select } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TradingSymbol } from '@/types/account';

interface InstrumentSelectorProps {
  value: TradingSymbol | null;
  onChange: (value: TradingSymbol | null) => void;
  availableInstruments: TradingSymbol[] | undefined;
  disabled?: boolean;
  error?: string;
}

export function InstrumentSelector({
  value,
  onChange,
  availableInstruments,
  disabled,
  error,
}: InstrumentSelectorProps) {
  const { t } = useTranslation();

  const instrumentOptions = availableInstruments
    ? availableInstruments.map((instrument) => ({
        value: instrument,
        label: instrument.replace(/_/g, ' '),
      }))
    : [];

  // Auto-select first instrument if none selected
  useEffect(() => {
    if (!value && instrumentOptions.length > 0) {
      onChange(instrumentOptions[0].value as TradingSymbol);
    }
  }, [instrumentOptions, value, onChange]);

  return (
    <Select
      label={t('action.selectInstrument')}
      placeholder={t('action.selectInstrumentPlaceholder')}
      data={instrumentOptions}
      value={value}
      onChange={(val) => onChange(val as TradingSymbol | null)}
      disabled={disabled || instrumentOptions.length === 0}
      error={error}
      searchable
      nothingFoundMessage={t('action.noInstrumentsAvailable')}
    />
  );
}
