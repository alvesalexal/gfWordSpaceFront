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
import { MaskedTextField } from '@/components/core/masked-text-field';

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
              <MaskedTextField
                value={phone}
                onAccept={(_maskedValue, unmaskedValue) => setPhone(unmaskedValue)}
                mask="(00) 00000-0000"
                label="Telefone"
                placeholder="(XX) XXXXX-XXXX"
                fullWidth
              />
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
