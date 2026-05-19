import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  intervalMs: number;
  enabled?: boolean;
}

export function usePolling(
  callback: () => Promise<void> | void,
  { intervalMs, enabled = true }: UsePollingOptions,
): { isPolling: boolean } {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return clear;
  }, [intervalMs, enabled, clear]);

  return { isPolling: enabled && intervalRef.current !== null };
}
