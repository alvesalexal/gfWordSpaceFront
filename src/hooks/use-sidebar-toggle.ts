'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sidebar-pinned';

export interface UseSidebarToggleReturn {
  isPinned: boolean;
  toggleSidebar: () => void;
  setPinned: (value: boolean) => void;
}

export function useSidebarToggle(): UseSidebarToggleReturn {
  const [isPinned, setIsPinned] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsPinned(stored === 'true');
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsPinned((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const setPinned = useCallback((value: boolean) => {
    setIsPinned(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return { isPinned, toggleSidebar, setPinned };
}
