'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { LoadingButton } from '@/components/core/loading-button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';

const schema = zod.object({ email: zod.string().min(1, { message: 'Email é obrigatório' }).email('Email inválido') });

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error, data } = await authClient.resetPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setResetToken(data?.resetToken || null);
      setIsPending(false);
    },
    [setError]
  );

  if (resetToken) {
    return (
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h5">Redefinir senha</Typography>
          <Typography color="text.secondary" variant="body2">
            Copie o token abaixo e use na página de redefinição de senha.
          </Typography>
        </Stack>
        <Alert severity="info">
          <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {resetToken}
          </Typography>
        </Alert>
        <Button component={RouterLink} href={paths.auth.confirmResetPassword} variant="contained">
          Redefinir senha
        </Button>
        <Link component={RouterLink} href={paths.auth.signIn} variant="subtitle2">
          Voltar para o login
        </Link>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h5">Esqueceu a senha?</Typography>
        <Typography color="text.secondary" variant="body2">
          Informe seu email para receber um token de redefinição.
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email</InputLabel>
                <OutlinedInput {...field} label="Email" type="email" />
                {errors.email ? <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errors.root ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: '12px',
                color: 'error.dark',
                '& .MuiAlert-icon': { color: 'error.main' },
              }}
            >
              {errors.root.message}
            </Alert>
          ) : null}
          <LoadingButton loading={isPending} type="submit" variant="contained">
            Enviar token
          </LoadingButton>
          <Link component={RouterLink} href={paths.auth.signIn} variant="subtitle2">
            Voltar para o login
          </Link>
        </Stack>
      </form>
    </Stack>
  );
}
