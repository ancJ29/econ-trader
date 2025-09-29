import { useMediaQuery } from '@mantine/hooks';

/**
 * Mobile breakpoint used across the application
 * Matches Mantine's default 'sm' breakpoint
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns true if viewport width is <= 768px, false otherwise
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
}
