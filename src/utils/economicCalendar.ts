import type { TFunction } from 'i18next';

export function getImpactColor(impact: number): string {
  if (impact === 3) return 'red';
  if (impact === 2) return 'yellow';
  return 'gray';
}

export function getImpactLabel(impact: number, t: TFunction): string {
  if (impact === 3) return t('impactHigh');
  if (impact === 2) return t('impactMedium');
  return t('impactLow');
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatValue(value: number | undefined, isPercentage: boolean): string {
  if (value === undefined) return '-';
  return isPercentage ? `${value}%` : value.toString();
}
