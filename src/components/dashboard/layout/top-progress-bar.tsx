'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

export function TopProgressBar(): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <LinearProgress
        color="primary"
        variant={loading ? 'indeterminate' : 'determinate'}
        value={loading ? 0 : 100}
        sx={{
          height: 3,
          opacity: loading ? 1 : 0,
          transition: 'opacity 0.2s ease',
          '& .MuiLinearProgress-bar': {
            transition: 'transform 0.2s ease-out',
          },
        }}
      />
    </Box>
  );
}
