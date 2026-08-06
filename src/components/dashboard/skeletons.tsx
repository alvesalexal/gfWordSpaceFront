'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function StatCardSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ContentCardSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width="50%" height={20} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1, mt: 1 }} />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function HeaderSkeleton({ showButton = true }: { showButton?: boolean }): React.JSX.Element {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Skeleton variant="text" width={200} height={40} />
      {showButton && <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />}
    </Stack>
  );
}

export function DashboardSkeleton(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width={260} height={40} />
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} xs={12} sm={6} lg={3}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width={180} height={28} />
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="center">
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export function GridCardsSkeleton({ columns = 6 }: { columns?: number }): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <HeaderSkeleton />
      <Grid container spacing={3}>
        {Array.from({ length: columns }).map((_, i) => (
          <Grid key={i} xs={12} md={6} lg={4}>
            <ContentCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export function AccountSkeleton(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width={180} height={40} />
      <Grid container spacing={3}>
        <Grid lg={4} md={6} xs={12}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Skeleton variant="circular" width={96} height={96} />
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="80%" height={20} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid lg={8} md={6} xs={12}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i}>
                    <Skeleton variant="text" width="30%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
