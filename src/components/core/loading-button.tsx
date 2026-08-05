'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { ButtonProps } from '@mui/material/Button';

export interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  children,
  disabled,
  startIcon,
  ...props
}: LoadingButtonProps): React.JSX.Element {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          startIcon
        )
      }
    >
      {children}
    </Button>
  );
}
