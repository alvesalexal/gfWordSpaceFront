'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button, Dialog, DialogActions, DialogContent, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

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

export function NewContentsCard(): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState<string>('');

  const handeChangeContent = (content: string) => {
    setContent(content);
  };

  return (
    <>
      <Dialog
        maxWidth="lg"
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
      >
        <DialogContent>
          <form>
            <Editor content={''} handeChangeContent={handeChangeContent} />
            <DialogActions>
              <Box width={'100%'} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" type="submit">
                  Salvar
                </Button>
              </Box>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Box onClick={() => setOpen(true)}>
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
            sx={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {/*<Avatar
            sx={{ img: { transition: 'transform 0.3s ease' }, width: '100%', height: '100%', opacity: 0.5 }}
            variant="rounded"
            />*/}
            <Icon icon="ph:plus" width={100} height={100} />
            <Typography>adicionar conteúdo</Typography>
          </Box>
        </Card>
      </Box>
    </>
  );
}
