'use client';

import { useColorScheme } from '@mui/material/styles';

export interface UseThemeToggleReturn {
  mode: 'dark' | 'light';
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'dark' | 'light') => void;
}

export function useThemeToggle(): UseThemeToggleReturn {
  const { mode, setMode } = useColorScheme();

  const resolvedMode = mode === 'light' ? 'light' : 'dark';

  const toggleColorScheme = (): void => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const setColorScheme = (scheme: 'dark' | 'light'): void => {
    setMode(scheme);
  };

  return {
    mode: resolvedMode,
    toggleColorScheme,
    setColorScheme,
  };
}
