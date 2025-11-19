import type { OrderType } from '@/types/account';
import { useTranslation } from 'react-i18next';

const ORDER_TYPE_MAP = {
  STOP_LOSS: 'stopLoss',
  TAKE_PROFIT: 'takeProfit',
  MARKET: 'market',
  LIMIT: 'limit',
} as const;

export function OrderType({ type }: { type: OrderType }) {
  const { t } = useTranslation();
  return t(`order.${ORDER_TYPE_MAP[type]}`);
}
