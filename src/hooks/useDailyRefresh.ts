import { useEffect, useRef, useCallback } from 'react';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const useDailyRefresh = (
  onRefresh: () => Promise<void>,
  enabled: boolean = true
) => {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshRef = useRef<Date>(new Date());

  const scheduleNextRefresh = useCallback(() => {
    if (!enabled) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Calculate time until next 24-hour mark
    const now = new Date();
    const timeSinceLastRefresh = now.getTime() - lastRefreshRef.current.getTime();
    const timeUntilNextRefresh = TWENTY_FOUR_HOURS_MS - timeSinceLastRefresh;

    // If more than 24 hours have passed, refresh immediately
    if (timeUntilNextRefresh <= 0) {
      onRefresh().then(() => {
        lastRefreshRef.current = new Date();
        scheduleNextRefresh();
      });
    } else {
      // Schedule refresh for the remaining time
      intervalRef.current = setTimeout(() => {
        onRefresh().then(() => {
          lastRefreshRef.current = new Date();
          scheduleNextRefresh();
        });
      }, timeUntilNextRefresh);
    }
  }, [onRefresh, enabled]);

  useEffect(() => {
    if (enabled) {
      scheduleNextRefresh();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [enabled, scheduleNextRefresh]);

  const manualRefresh = useCallback(async () => {
    await onRefresh();
    lastRefreshRef.current = new Date();
    scheduleNextRefresh();
  }, [onRefresh, scheduleNextRefresh]);

  return { manualRefresh };
};

