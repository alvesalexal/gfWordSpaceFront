'use client';

import * as React from 'react';
import { api } from '@/lib/api/client';
import { useLoading } from '@/contexts/loading-context';

export function useApiLoading(): void {
  const { startLoading, stopLoading } = useLoading();

  React.useEffect(() => {
    const unsubscribe = api.onLoadingChange((loading) => {
      if (loading) {
        startLoading();
      } else {
        stopLoading();
      }
    });

    return unsubscribe;
  }, [startLoading, stopLoading]);
}
