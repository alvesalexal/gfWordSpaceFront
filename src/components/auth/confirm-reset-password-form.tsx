'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
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

const schema = zod.object({
  token: zod.string().min(1, { message: 'Token é obrigatório' }),
  password: zod.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: zod.string().min(1, { message: 'Confirmação de senha é obrigatória' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = { token: '', password: '', confirmPassword: '' } satisfies Values;

export function ConfirmResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.confirmPassword({
        token: values.token,
        password: values.password,
      });

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setSuccess(true);
      setIsPending(false);
    },
    [setError]
  );

  if (success) {
    return (
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h5">Senha redefinida!</Typography>
          <Typography color="text.secondary" variant="body2">
            Sua senha foi atualizada com sucesso.
          </Typography>
        </Stack>
        <Button component={RouterLink} href={paths.auth.signIn} variant="contained">
          Fazer login
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h5">Redefinir senha</Typography>
        <Typography color="text.secondary" variant="body2">
          Cole o token que você recebeu e defina sua nova senha.
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="token"
            render={({ field }) => (
              <FormControl error={Boolean(errors.token)}>
                <InputLabel>Token</InputLabel>
                <OutlinedInput {...field} label="Token" multiline minRows={2} />
                {errors.token ? <FormHelperText>{errors.token.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Nova senha</InputLabel>
                <OutlinedInput {...field} label="Nova senha" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.confirmPassword)}>
                <InputLabel>Confirmar senha</InputLabel>
                <OutlinedInput {...field} label="Confirmar senha" type="password" />
                {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <LoadingButton loading={isPending} type="submit" variant="contained">
            Redefinir senha
          </LoadingButton>
          <Link component={RouterLink} href={paths.auth.signIn} variant="subtitle2">
            Voltar para o login
          </Link>
        </Stack>
      </form>
    </Stack>
  );
}
