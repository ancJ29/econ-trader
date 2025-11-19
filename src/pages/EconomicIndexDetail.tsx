import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { useIsMobile } from '@/hooks/useIsMobile';
import { economicCalendarService } from '@/services/economicCalendar';
import type { EconomicIndex } from '@/types/calendar';
import { formatDate, formatValue, getImpactColor, getImpactLabel } from '@/utils/economicCalendar';
import { capitalize } from '@an-oct/vani-kit';
import { BarChart } from '@mantine/charts';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

function EconomicIndexDetail() {
  const { t } = useTranslation();
  const { eventCode } = useParams<{ eventCode: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const computedColorScheme = useComputedColorScheme('light');
  const theme = useMantineTheme();

  const tooltipStyles = {
    backgroundColor: computedColorScheme === 'dark' ? theme.colors.dark[7] : '#ffffff',
    border: `1px solid ${computedColorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    borderRadius: theme.radius.sm,
    padding: '8px 12px',
    minWidth: '120px',
    boxShadow: theme.shadows.md,
  };

  const tooltipTextColor = computedColorScheme === 'dark' ? '#ffffff' : '#000000';

  const [index, setIndex] = useState<EconomicIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpened, setDetailsOpened] = useState(false);

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
      <Stack gap="lg" py="xl" w={isMobile ? '90vw' : '70vw'}>
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
            {isMobile ? (
              <>
                <Paper p="md" withBorder>
                  <Stack gap="md">
                    <Group>
                      <Title order={2}>{index.name}</Title>
                      <Badge color={getImpactColor(index.impact)} size="lg">
                        {getImpactLabel(index.impact, t)}
                      </Badge>
                    </Group>

                    <Button
                      onClick={() => setDetailsOpened(!detailsOpened)}
                      variant="light"
                      fullWidth
                    >
                      {detailsOpened ? t('hideDetails') : t('showDetails')}
                    </Button>

                    <Collapse in={detailsOpened}>
                      <Stack gap="md">
                        <Text size="sm" c="dimmed">
                          {index.detail}
                        </Text>

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
                          <Text size="sm">{capitalize(index.interval)}</Text>
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
                    </Collapse>
                  </Stack>
                </Paper>

                <Paper p="md" withBorder>
                  <Stack gap="md">
                    <Title order={3}>{t('historicalData')}</Title>
                    <Text size="sm" c="dimmed">
                      {t('showingRecords', { count: index.historyData.length })}
                    </Text>

                    <Tabs defaultValue="chart">
                      <Tabs.List grow>
                        <Tabs.Tab value="chart">{t('chart')}</Tabs.Tab>
                        <Tabs.Tab value="table">{t('table')}</Tabs.Tab>
                      </Tabs.List>

                      <Tabs.Panel value="chart" pt="md">
                        <BarChart
                          h={300}
                          data={index.historyData
                            .slice()
                            .reverse()
                            .map((record) => ({
                              date: record.period,
                              Actual: record.actual ?? null,
                              // Forecast: record.forecast ?? null,
                              // Previous: record.previous ?? null,
                            }))}
                          dataKey="date"
                          series={[
                            { name: 'Actual', color: 'blue.6' },
                            // { name: 'Forecast', color: 'orange.6' },
                            // { name: 'Previous', color: 'gray.6' },
                          ]}
                          barProps={{ barSize: 40 }}
                          tooltipProps={{
                            wrapperStyle: { zIndex: 1000 },
                            contentStyle: tooltipStyles,
                            labelStyle: {
                              color: tooltipTextColor,
                              fontWeight: 600,
                              marginBottom: '4px',
                            },
                            itemStyle: {
                              color: tooltipTextColor,
                              padding: '2px 0',
                            },
                          }}
                        />
                      </Tabs.Panel>

                      <Tabs.Panel value="table" pt="md">
                        <ScrollArea h={400}>
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
                                        {t('economicCalendars.actual')}
                                      </Text>
                                      <Text size="sm" fw={500}>
                                        {formatValue(record.actual, index.isPercentage)}
                                      </Text>
                                    </Stack>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed">
                                        {t('economicCalendars.forecast')}
                                      </Text>
                                      <Text size="sm" fw={500}>
                                        {formatValue(record.forecast, index.isPercentage)}
                                      </Text>
                                    </Stack>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed">
                                        {t('economicCalendars.previous')}
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
                        </ScrollArea>
                      </Tabs.Panel>
                    </Tabs>
                  </Stack>
                </Paper>
              </>
            ) : (
              <>
                <Paper p="md" withBorder>
                  <Stack gap="md">
                    <Group>
                      <Title order={2}>{index.name}</Title>
                      <Badge color={getImpactColor(index.impact)} size="lg">
                        {getImpactLabel(index.impact, t)}
                      </Badge>
                    </Group>

                    <Grid>
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Text size="sm" c="dimmed">
                            {index.detail}
                          </Text>

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
                            <Text size="sm">{capitalize(index.interval)}</Text>
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
                      <Grid.Col span={6}>
                        <Stack gap="sm">
                          <Title order={4}>{t('chart')}</Title>
                          <BarChart
                            h={300}
                            data={index.historyData
                              .slice()
                              .reverse()
                              .map((record) => ({
                                date: record.period,
                                Actual: record.actual ?? null,
                                Forecast: record.forecast ?? null,
                                Previous: record.previous ?? null,
                              }))}
                            dataKey="date"
                            series={[
                              { name: 'Actual', color: 'blue.6' },
                              { name: 'Forecast', color: 'orange.6' },
                              { name: 'Previous', color: 'gray.6' },
                            ]}
                            barProps={{ barSize: 40 }}
                            tooltipProps={{
                              wrapperStyle: { zIndex: 1000 },
                              contentStyle: tooltipStyles,
                              labelStyle: {
                                color: tooltipTextColor,
                                fontWeight: 600,
                                marginBottom: '4px',
                              },
                              itemStyle: {
                                color: tooltipTextColor,
                                padding: '2px 0',
                              },
                            }}
                          />
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

                    <ScrollArea h={500}>
                      <Table striped withTableBorder withColumnBorders>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>{t('date')}</Table.Th>
                            <Table.Th>{t('period')}</Table.Th>
                            <Table.Th>{t('economicCalendars.actual')}</Table.Th>
                            <Table.Th>{t('economicCalendars.forecast')}</Table.Th>
                            <Table.Th>{t('economicCalendars.previous')}</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {index.historyData.map((record) => (
                            <Table.Tr key={record.ts}>
                              <Table.Td>{formatDate(record.ts)}</Table.Td>
                              <Table.Td>{record.period}</Table.Td>
                              <Table.Td>{formatValue(record.actual, index.isPercentage)}</Table.Td>
                              <Table.Td>
                                {formatValue(record.forecast, index.isPercentage)}
                              </Table.Td>
                              <Table.Td>
                                {formatValue(record.previous, index.isPercentage)}
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Stack>
                </Paper>
              </>
            )}
          </>
        )}
      </Stack>
    </>
  );
}

export default EconomicIndexDetail;
