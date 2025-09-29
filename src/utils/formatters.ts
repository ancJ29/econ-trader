/**
 * Format number with locale-aware formatting and specified decimal places
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format timestamp to locale-aware date/time string
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Format profit/loss value with sign
 */
export const formatPnl = (value: number, decimals = 2): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}`;
};

/**
 * Get color for profit/loss value
 */
export const getPnlColor = (value: number): string => {
  return value >= 0 ? 'green' : 'red';
};

/**
 * Get color for order status
 */
export const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'blue';
    case 'filled':
      return 'green';
    case 'cancelled':
      return 'red';
    case 'partially_filled':
      return 'yellow';
    default:
      return 'gray';
  }
};

/**
 * Get color for order side (buy/sell)
 */
export const getOrderSideColor = (side: string) => {
  return side === 'buy' ? 'green' : 'red';
};

/**
 * Get color for position side (long/short)
 */
export const getPositionSideColor = (side: string) => {
  return side === 'long' ? 'green' : 'red';
};

/**
 * Get color for transaction type
 */
export const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'trade':
      return 'blue';
    case 'fee':
      return 'orange';
    case 'funding':
      return 'grape';
    case 'swap':
      return 'cyan';
    default:
      return 'gray';
  }
};

/**
 * Format currency value with appropriate symbol and decimals
 * For crypto: 2-8 decimals based on value
 * For fiat: 2 decimals
 */
export const formatCurrency = (value: number, symbol?: string) => {
  // Determine decimals based on value magnitude
  let decimals = 2;
  if (symbol && ['BTC', 'ETH', 'BNB'].includes(symbol)) {
    if (Math.abs(value) < 0.01) decimals = 8;
    else if (Math.abs(value) < 1) decimals = 6;
    else decimals = 4;
  } else if (Math.abs(value) < 1) {
    decimals = 4;
  }

  return formatNumber(value, decimals);
};

/**
 * Format percentage value
 */
export const formatPercentage = (value: number, decimals = 2) => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Format leverage value (e.g., "10x")
 */
export const formatLeverage = (value: number) => {
  return `${value}x`;
};
