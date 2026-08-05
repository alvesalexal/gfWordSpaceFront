'use client';

import { useApiLoading } from '@/hooks/use-api-loading';

export function ApiLoadingListener(): null {
  useApiLoading();
  return null;
}
