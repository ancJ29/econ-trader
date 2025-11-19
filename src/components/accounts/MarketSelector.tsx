import { EXCHANGE_MARKETS, MARKET_LABELS, MARKET_SYMBOLS } from '@/constants/markets';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { TradingExchange, TradingMarket, TradingSymbol } from '@/types/account';
import { Accordion, Badge, Button, Checkbox, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MarketSelectorProps {
  exchange: TradingExchange;
  availableMarkets?: TradingMarket[];
  value: Partial<Record<TradingMarket, TradingSymbol[]>>;
  onChange: (markets: Partial<Record<TradingMarket, TradingSymbol[]>>) => void;
}

export const MarketSelector = ({
  availableMarkets,
  exchange,
  value,
  onChange,
}: MarketSelectorProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedMarkets, setSelectedMarkets] = useState<TradingMarket[]>([]);
  const [marketSymbols, setMarketSymbols] =
    useState<Partial<Record<TradingMarket, TradingSymbol[]>>>(value);

  const markets = availableMarkets ?? EXCHANGE_MARKETS[exchange];

  useEffect(() => {
    const markets = Object.keys(value) as TradingMarket[];
    setSelectedMarkets(markets);
    setMarketSymbols(value);
  }, [value]);

  const handleMarketToggle = (market: TradingMarket) => {
    const newSelectedMarkets = selectedMarkets.includes(market)
      ? selectedMarkets.filter((m) => m !== market)
      : [...selectedMarkets, market];

    setSelectedMarkets(newSelectedMarkets);

    if (!newSelectedMarkets.includes(market)) {
      const newMarketSymbols = { ...marketSymbols };
      delete newMarketSymbols[market];
      setMarketSymbols(newMarketSymbols);
      onChange(newMarketSymbols);
    }
  };

  const handleSymbolToggle = (market: TradingMarket, symbol: TradingSymbol) => {
    const currentSymbols = marketSymbols[market] || [];
    const newSymbols = currentSymbols.includes(symbol)
      ? currentSymbols.filter((s) => s !== symbol)
      : [...currentSymbols, symbol];

    const newMarketSymbols = {
      ...marketSymbols,
      [market]: newSymbols,
    };
    setMarketSymbols(newMarketSymbols);
    onChange(newMarketSymbols);
  };

  const handleSelectAllSymbols = (market: TradingMarket) => {
    const newMarketSymbols = {
      ...marketSymbols,
      [market]: MARKET_SYMBOLS[market],
    };
    setMarketSymbols(newMarketSymbols);
    onChange(newMarketSymbols);
  };

  const handleClearSymbols = (market: TradingMarket) => {
    const newMarketSymbols = {
      ...marketSymbols,
      [market]: [],
    };
    setMarketSymbols(newMarketSymbols);
    onChange(newMarketSymbols);
  };

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        {t('selectMarkets')}
      </Text>
      <ScrollArea h={isMobile ? '65vh' : '75vh'} type="auto">
        {markets.map((market, index) => {
          const isSelected = selectedMarkets.includes(market);
          const symbols = marketSymbols[market] || [];
          return (
            <Accordion
              key={market}
              variant="contained"
              value={isSelected ? market : null}
              onChange={() => handleMarketToggle(market)}
              mt={index === 0 ? 0 : 'sm'}
            >
              <Accordion.Item value={market}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={500}>
                      {MARKET_LABELS[market]}
                    </Text>
                    {isSelected && symbols.length > 0 && (
                      <Badge size="sm" variant="light">
                        {symbols.length} {t('symbolsSelected')}
                      </Badge>
                    )}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="sm">
                    <Group gap="xs" justify="space-between">
                      <Text size="sm" fw={500}>
                        {t('selectSymbols')}
                      </Text>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => handleSelectAllSymbols(market)}
                        >
                          {t('selectAll')}
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() => handleClearSymbols(market)}
                        >
                          {t('clearAll')}
                        </Button>
                      </Group>
                    </Group>
                    <Stack gap="xs">
                      {MARKET_SYMBOLS[market].map((symbol) => (
                        <Checkbox
                          key={symbol}
                          label={symbol}
                          checked={symbols.includes(symbol)}
                          onChange={() => handleSymbolToggle(market, symbol)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          );
        })}
      </ScrollArea>
    </Stack>
  );
};
