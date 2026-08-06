'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { LoadingButton } from '@/components/core/loading-button';

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
      <DialogTitle sx={{ px: 3, py: 2 }}>{title}</DialogTitle>
      <DialogContent>
        <form id="form-dialog" onSubmit={onSubmit}>
          {children}
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>
          {cancelLabel}
        </Button>
        <LoadingButton type="submit" form="form-dialog" variant="contained" loading={isPending}>
          {submitLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
