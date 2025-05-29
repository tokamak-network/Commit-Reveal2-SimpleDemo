"use client";

import { useEffect, useState } from "react";

interface AutoRefreshOptions {
  initialDelay?: number; // 첫 실행까지의 지연 시간 (ms)
  interval?: number; // 반복 간격 (ms)
}

export function useAutoRefresh(
  refetchFn: () => Promise<any>,
  options: AutoRefreshOptions = {}
) {
  const { initialDelay = 30000, interval = 60000 } = options;
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = () => {
      if (isMounted) {
        refetchFn().catch((error) => {
          console.error("Error refetching data:", error);
        });
        setRefreshCounter((prev) => prev + 1);
      }
    };

    // 초기 지연 후 첫 실행
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        fetchData();
        // 그 후 설정된 간격마다 실행
        intervalId = setInterval(fetchData, interval);
      }
    }, initialDelay);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [refetchFn, initialDelay, interval]);

  const manualRefresh = () => {
    setIsSpinning(true);
    setRefreshCounter((prev) => prev + 1);
    refetchFn().finally(() => {
      setTimeout(() => setIsSpinning(false), 500);
    });
  };

  return {
    refreshCounter,
    isSpinning,
    manualRefresh,
  };
}
