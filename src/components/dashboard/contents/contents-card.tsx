'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { hexToRGB } from '@/utils/functions';
import { useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import dayjs from 'dayjs';

export interface Contents {
  id: string;
  title: string;
  description: string;
  logo: string;
  installs: number;
  updatedAt: Date;
}

export interface ContentsCardProps {
  contents: Contents;
}

export function ContentsCard({ contents }: ContentsCardProps): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();

  const handleClickContent = () => {
    router.push(`/dashboard/content-detail?id=${contents.id}`);
  };

  return (
    <Box onClick={handleClickContent}>
      <Card
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: 150,
          ':hover': {
            img: {
              transform: 'scale(1.2)',
            },
          },
        }}
      >
        <Box
          zIndex={1}
          sx={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
        >
          <Avatar
            sx={{ img: { transition: 'transform 0.3s ease' }, width: '100%', height: '100%', opacity: 0.5 }}
            src={contents.logo}
            variant="rounded"
          />
        </Box>
        <Box zIndex={2}>
          <CardContent sx={{ flex: '1 1 auto' }}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography align="center" variant="h5" fontWeight={600}>
                  {contents.title}
                </Typography>
                <Typography align="center" variant="body1">
                  {contents.description}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Box>
        <Box zIndex={2} sx={{ bgcolor: `${hexToRGB(theme.palette.primary.main, 0.2)}` }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ height: 2, alignItems: 'center', justifyContent: 'space-between', p: 1.3 }}
          >
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
              <ClockIcon fontSize="var(--icon-fontSize-sm)" />
              <Typography color={theme.palette.text.primary} display="inline" variant="body2">
                Criado em {dayjs(contents.updatedAt).format('MMM D, YYYY')}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
