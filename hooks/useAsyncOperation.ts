/**
 * useAsyncOperation Hook
 * Reusable hook for handling async operations with loading, error, and data states
 */

import { useCallback, useState } from "react";

interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
): UseAsyncOperationReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    setData(options.initialData ?? null);
    setLoading(false);
    setError(null);
  }, [options.initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}
