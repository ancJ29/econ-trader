import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import {
  Title,
  Stack,
  Alert,
  Text,
  Badge,
  Group,
  Paper,
  Table,
  Anchor,
  Grid,
  Card,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { economicCalendarService, type EconomicIndex } from '@/services/economicCalendar';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';

function EconomicIndexDetail() {
  const { t } = useTranslation();
  const { eventCode } = useParams<{ eventCode: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [index, setIndex] = useState<EconomicIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventCode) {
      setError(t('eventCodeRequired'));
      setIsLoading(false);
      return;
    }

    const fetchIndexData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await economicCalendarService.getEconomicIndex(eventCode);
        setIndex(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('unknownError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndexData();
  }, [eventCode, t]);

  const getImpactColor = (impact: number): string => {
    if (impact === 3) return 'red';
    if (impact === 2) return 'yellow';
    return 'gray';
  };

  const getImpactLabel = (impact: number): string => {
    if (impact === 3) return t('impactHigh');
    if (impact === 2) return t('impactMedium');
    return t('impactLow');
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatValue = (value: number | undefined, isPercentage: boolean): string => {
    if (value === undefined) return '-';
    return isPercentage ? `${value}%` : value.toString();
  };

  if (!eventCode) {
    return (
      <Stack gap="lg" py="xl">
        <Alert color="red" title={t('error')}>
          {t('eventCodeRequired')}
        </Alert>
      </Stack>
    );
  }

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <Stack gap="lg" py="xl" w={isMobile ? '100%' : '70vw'}>
        <Group justify="space-between" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <Title order={isMobile ? 2 : 1}>{t('economicIndexDetail')}</Title>
          <Anchor onClick={() => navigate('/economic-calendar')} style={{ cursor: 'pointer' }}>
            {t('backToCalendar')}
          </Anchor>
        </Group>

        {error && (
          <Alert color="red" title={t('error')}>
            {error}
          </Alert>
        )}

        {!error && index && (
          <>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Group>
                  <Title order={2}>{index.name}</Title>
                  <Badge color={getImpactColor(index.impact)} size="lg">
                    {getImpactLabel(index.impact)}
                  </Badge>
                </Group>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 9 }}>
                    <Text size="sm" c="dimmed">
                      {index.detail}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Stack gap="md" ml={isMobile ? 0 : 'xl'} mt={isMobile ? 'md' : 0}>
                      <Group>
                        <div>
                          <Text size="xs" c="dimmed">
                            {t('country')}
                          </Text>
                          <Badge>{index.countryCode}</Badge>
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">
                            {t('currency')}
                          </Text>
                          <Badge>{index.currencyCode}</Badge>
                        </div>
                      </Group>

                      <div>
                        <Text size="xs" c="dimmed">
                          {t('interval')}
                        </Text>
                        <Text size="sm">{index.interval}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">
                          {t('source')}
                        </Text>
                        <Anchor href={index.url} target="_blank" size="sm">
                          {index.source}
                        </Anchor>
                      </div>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>

            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>{t('historicalData')}</Title>
                <Text size="sm" c="dimmed">
                  {t('showingRecords', { count: index.historyData.length })}
                </Text>

                {isMobile ? (
                  <Stack gap="md">
                    {index.historyData.map((record) => (
                      <Card key={record.ts} padding="md" radius="md" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between" align="flex-start">
                            <Text size="sm" c="dimmed">
                              {formatDate(record.ts)}
                            </Text>
                            <Badge size="sm" variant="light">
                              {record.period}
                            </Badge>
                          </Group>

                          <Divider />

                          <SimpleGrid cols={3}>
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                {t('actual')}
                              </Text>
                              <Text size="sm" fw={500}>
                                {formatValue(record.actual, index.isPercentage)}
                              </Text>
                            </Stack>
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                {t('forecast')}
                              </Text>
                              <Text size="sm" fw={500}>
                                {formatValue(record.forecast, index.isPercentage)}
                              </Text>
                            </Stack>
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                {t('previous')}
                              </Text>
                              <Text size="sm" fw={500}>
                                {formatValue(record.previous, index.isPercentage)}
                              </Text>
                            </Stack>
                          </SimpleGrid>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Table striped withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('date')}</Table.Th>
                        <Table.Th>{t('period')}</Table.Th>
                        <Table.Th>{t('actual')}</Table.Th>
                        <Table.Th>{t('forecast')}</Table.Th>
                        <Table.Th>{t('previous')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {index.historyData.map((record) => (
                        <Table.Tr key={record.ts}>
                          <Table.Td>{formatDate(record.ts)}</Table.Td>
                          <Table.Td>{record.period}</Table.Td>
                          <Table.Td>{formatValue(record.actual, index.isPercentage)}</Table.Td>
                          <Table.Td>{formatValue(record.forecast, index.isPercentage)}</Table.Td>
                          <Table.Td>{formatValue(record.previous, index.isPercentage)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </>
  );
}

export default EconomicIndexDetail;
