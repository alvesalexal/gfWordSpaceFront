'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { LoadingButton } from '@/components/core/loading-button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Envelope } from '@phosphor-icons/react/dist/ssr/Envelope';
import { Lock } from '@phosphor-icons/react/dist/ssr/Lock';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email obrigatorio' }).email('Email invalido'),
  password: zod.string().min(1, { message: 'Senha obrigatoria' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;



export function SignInForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);

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

      const { error } = await authClient.signInWithPassword(values);

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
    <Stack spacing={4}>
      <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #15b79f 0%, #635bff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}
          variant="h4"
        >
          Bem-vindo de volta
        </Typography>
        <Typography
          sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}
          variant="body2"
        >
          Entre na sua conta para continuar
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} fullWidth>
                <InputLabel
                  sx={{
                    '&.Mui-focused': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                >
                  Email
                </InputLabel>
                <OutlinedInput
                  {...field}
                  label="Email"
                  type="email"
                  startAdornment={
                    <InputAdornment position="start">
                      <Envelope
                        fontSize="var(--icon-fontSize-md)"
                        style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                      />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    transition: 'all 0.2s ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(21, 183, 159, 0.5)',
                      borderWidth: 1.5,
                    },
                    '& input': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                />
                {errors.email ? <FormHelperText sx={{ color: '#f97970' }}>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)} fullWidth>
                <InputLabel
                  sx={{
                    '&.Mui-focused': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                >
                  Senha
                </InputLabel>
                <OutlinedInput
                  {...field}
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  startAdornment={
                    <InputAdornment position="start">
                      <Lock
                        fontSize="var(--icon-fontSize-md)"
                        style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                      />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={(): void => {
                          setShowPassword(!showPassword);
                        }}
                        edge="end"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.4)',
                          '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
                        }}
                      >
                        {showPassword ? (
                          <EyeIcon fontSize="var(--icon-fontSize-md)" />
                        ) : (
                          <EyeSlashIcon fontSize="var(--icon-fontSize-md)" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    transition: 'all 0.2s ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(21, 183, 159, 0.5)',
                      borderWidth: 1.5,
                    },
                    '& input': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                />
                {errors.password ? (
                  <FormHelperText sx={{ color: '#f97970' }}>{errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              component={RouterLink}
              href={paths.auth.resetPassword}
              underline="hover"
              sx={{
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.825rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: '#15b79f',
                },
              }}
            >
              Esqueceu a senha?
            </Link>
          </Box>

          {errors.root ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: '12px',
                backgroundColor: 'rgba(249, 121, 112, 0.1)',
                border: '1px solid rgba(249, 121, 112, 0.2)',
                color: '#f97970',
                '& .MuiAlert-icon': { color: '#f97970' },
              }}
            >
              {errors.root.message}
            </Alert>
          ) : null}

          <LoadingButton
            loading={isPending}
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '0.3px',
            }}
          >
            Entrar
          </LoadingButton>
        </Stack>
      </form>

      <Typography align="center" sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.875rem' }}>
        Ainda nao tem conta?{' '}
        <Link
          component={RouterLink}
          href={paths.auth.signUp}
          underline="hover"
          sx={{
            color: '#15b79f',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            '&:hover': {
              color: '#2ed3b8',
            },
          }}
        >
          Cadastre-se
        </Link>
      </Typography>
    </Stack>
  );
}
