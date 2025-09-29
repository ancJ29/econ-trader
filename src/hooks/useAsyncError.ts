import { useState, useCallback } from 'react';

/**
 * Hook to throw errors from async functions to be caught by ErrorBoundary
 */
export function useAsyncError() {
  const [, setError] = useState();

  return useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
}
