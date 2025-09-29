import { Select } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TradingMarket } from '@/types/account';

interface MarketSelectorProps {
  value: TradingMarket | null;
  onChange: (value: TradingMarket | null) => void;
  availableMarkets: Partial<Record<TradingMarket, unknown>> | undefined;
  disabled?: boolean;
  error?: string;
}

const MARKET_LABELS: Record<TradingMarket, string> = {
  BN_SPOT: 'Binance Spot',
  BN_USDS_M: 'Binance USDⓈ-M Futures',
  BN_COIN_M: 'Binance COIN-M Futures',
  BB_USDT_PERP: 'Bybit USDT Perpetual',
  BB_USDC_PERP: 'Bybit USDC Perpetual',
  BB_Perpetual: 'Bybit Perpetual (Inverse)',
  BB_SPOT: 'Bybit Spot',
};

export function MarketSelector({
  value,
  onChange,
  availableMarkets,
  disabled,
  error,
}: MarketSelectorProps) {
  const { t } = useTranslation();

  const marketOptions = useMemo(() => {
    return availableMarkets
      ? Object.keys(availableMarkets).map((market) => ({
          value: market,
          label: MARKET_LABELS[market as TradingMarket] || market,
        }))
      : [];
  }, [availableMarkets]);

  // Auto-select first market if none selected
  useEffect(() => {
    if (!value && marketOptions.length > 0) {
      onChange(marketOptions[0].value as TradingMarket);
    }
  }, [marketOptions, value, onChange]);

  return (
    <Select
      label={t('action.selectMarket')}
      placeholder={t('action.selectMarketPlaceholder')}
      data={marketOptions}
      value={value}
      onChange={(val) => onChange(val as TradingMarket | null)}
      disabled={disabled || marketOptions.length === 0}
      error={error}
      searchable
      nothingFoundMessage={t('action.noMarketsAvailable')}
    />
  );
}
