'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = React.createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);
  const counterRef = React.useRef(0);

  const startLoading = React.useCallback(() => {
    counterRef.current += 1;
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      setIsLoading(false);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <Fade in={isLoading}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        </Box>
      </Fade>
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
