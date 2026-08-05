'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@/components/core/loading-button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Nome é obrigatório' }),
  email: zod.string().min(1, { message: 'Email é obrigatório' }).email('Email inválido'),
  password: zod.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  role: zod.string().min(1, { message: 'Perfil é obrigatório' }),
  phone: zod.string().optional(),
  terms: zod.boolean().refine((value) => value, 'Você deve aceitar os termos'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { name: '', email: '', password: '', role: 'student', phone: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone,
      });

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      await checkSession?.();
      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Cadastre-se</Typography>
        <Typography color="text.secondary" variant="body2">
          Já tem uma conta?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Entrar
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>Nome completo</InputLabel>
                <OutlinedInput {...field} label="Nome completo" />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email</InputLabel>
                <OutlinedInput {...field} label="Email" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Senha</InputLabel>
                <OutlinedInput {...field} label="Senha" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <FormControl error={Boolean(errors.role)}>
                <InputLabel>Perfil</InputLabel>
                <Select {...field} label="Perfil">
                  <MenuItem value="student">Aluno</MenuItem>
                  <MenuItem value="teacher">Professor</MenuItem>
                </Select>
                {errors.role ? <FormHelperText>{errors.role.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormControl>
                <InputLabel>Telefone (opcional)</InputLabel>
                <OutlinedInput {...field} label="Telefone (opcional)" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label={
                    <React.Fragment>
                      Li e aceito os <Link>termos e condições</Link>
                    </React.Fragment>
                  }
                />
                {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
              </div>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <LoadingButton loading={isPending} type="submit" variant="contained">
            Cadastrar
          </LoadingButton>
        </Stack>
      </form>
    </Stack>
  );
}
