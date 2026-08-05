'use client';

import * as React from 'react';
import { LoadingButton } from '@/components/core/loading-button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';

import { api, endpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export function AccountDetailsForm(): React.JSX.Element {
  const { user, checkSession } = useUser();
  const { showError, showSuccess } = useToast();
  const [isPending, setIsPending] = React.useState(false);
  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    try {
      await api.put(endpoints.person.byId(Number(user?.id)), { name, email, phone });
      if (checkSession) {
        await checkSession();
      }
      showSuccess('Perfil atualizado com sucesso');
    } catch (err) {
      showError('Erro ao atualizar perfil');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="As informações podem ser editadas" title="Perfil" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Nome</InputLabel>
                <OutlinedInput value={name} onChange={(e) => setName(e.target.value)} label="Nome" name="name" />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Email</InputLabel>
                <OutlinedInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email"
                  name="email"
                  type="email"
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Telefone</InputLabel>
                <OutlinedInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  label="Telefone"
                  name="phone"
                  type="tel"
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <LoadingButton type="submit" variant="contained" loading={isPending}>
            Salvar
          </LoadingButton>
        </CardActions>
      </Card>
    </form>
  );
}
