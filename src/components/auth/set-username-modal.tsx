'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

interface SetUsernameModalProps {
  open: boolean;
  onClose: () => void;
}

export function SetUsernameModal({ open, onClose }: SetUsernameModalProps): React.JSX.Element {
  const { checkSession } = useUser();
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);

  const handleSubmit = async () => {
    if (username.length < 3 || username.length > 20) {
      setError('Username deve ter entre 3 e 20 caracteres');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      setError('Apenas letras, números, _ e .');
      return;
    }

    setIsPending(true);
    setError('');

    const { error: apiError } = await authClient.setUsername(username);

    if (apiError) {
      setError(apiError);
      setIsPending(false);
      return;
    }

    await checkSession?.();
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Defina seu username</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Para continuar, escolha um username único.
        </Typography>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} disabled={isPending || username.length < 3}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
