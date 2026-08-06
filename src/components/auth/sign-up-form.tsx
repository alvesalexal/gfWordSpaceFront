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
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { XCircle } from '@phosphor-icons/react/dist/ssr/XCircle';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { MaskedTextField } from '@/components/core/masked-text-field';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Nome é obrigatório' }).regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras e espaços'),
  username: zod.string()
    .min(3, { message: 'Mínimo 3 caracteres' })
    .max(20, { message: 'Máximo 20 caracteres' })
    .regex(/^[a-zA-Z0-9_.]+$/, 'Apenas letras, números, _ e .'),
  email: zod.string().min(1, { message: 'Email é obrigatório' }).email('Email inválido'),
  password: zod.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  role: zod.string().min(1, { message: 'Perfil é obrigatório' }),
  phone: zod.string().optional(),
  terms: zod.boolean().refine((value) => value, 'Você deve aceitar os termos'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { name: '', username: '', email: '', password: '', role: 'student', phone: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = React.useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  const handleUsernameBlur = React.useCallback(
    async (value: string) => {
      if (value.length < 3) {
        setUsernameStatus('idle');
        return;
      }

      setUsernameStatus('checking');

      const { data } = await authClient.checkUsername(value);

      if (data) {
        setUsernameStatus(data.available ? 'available' : 'unavailable');
      } else {
        setUsernameStatus('idle');
      }
    },
    []
  );

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
        username: values.username,
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
                {errors.name ? <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)} fullWidth>
                <InputLabel>Username</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Username"
                  onBlur={(e) => {
                    field.onBlur();
                    handleUsernameBlur(e.target.value);
                  }}
                  endAdornment={
                    usernameStatus === 'checking' ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : usernameStatus === 'available' ? (
                      <InputAdornment position="end">
                        <CheckCircle size={22} weight="fill" style={{ color: 'var(--mui-palette-success-main)' }} />
                      </InputAdornment>
                    ) : usernameStatus === 'unavailable' ? (
                      <InputAdornment position="end">
                        <XCircle size={22} weight="fill" style={{ color: 'var(--mui-palette-error-main)' }} />
                      </InputAdornment>
                    ) : null
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: usernameStatus === 'available'
                        ? 'success.main'
                        : usernameStatus === 'unavailable'
                        ? 'error.main'
                        : undefined,
                    },
                  }}
                />
                {errors.username ? (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.username.message}</FormHelperText>
                ) : usernameStatus === 'unavailable' ? (
                  <FormHelperText sx={{ color: 'error.main' }}>Username já cadastrado</FormHelperText>
                ) : usernameStatus === 'available' ? (
                  <FormHelperText sx={{ color: 'success.main' }}>Username disponível</FormHelperText>
                ) : null}
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
                {errors.email ? <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText> : null}
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
                {errors.password ? <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText> : null}
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
                {errors.role ? <FormHelperText sx={{ color: 'error.main' }}>{errors.role.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <MaskedTextField
                value={field.value}
                onAccept={(_maskedValue, unmaskedValue) => field.onChange(unmaskedValue)}
                mask="(00) 00000-0000"
                label="Telefone (opcional)"
                placeholder="(XX) XXXXX-XXXX"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
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
                {errors.terms ? <FormHelperText sx={{ color: 'error.main' }}>{errors.terms.message}</FormHelperText> : null}
              </div>
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
            Cadastrar
          </LoadingButton>
        </Stack>
      </form>
    </Stack>
  );
}
