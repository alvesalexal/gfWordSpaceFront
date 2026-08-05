'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export function FormDialog({
  open,
  onClose,
  title,
  children,
  onSubmit,
  isPending = false,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  maxWidth = 'sm',
  fullWidth = true,
}: FormDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id="form-dialog" onSubmit={onSubmit}>
          {children}
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button type="submit" form="form-dialog" variant="contained" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
