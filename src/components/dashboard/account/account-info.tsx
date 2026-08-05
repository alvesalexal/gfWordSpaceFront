'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PencilSimple as PencilIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';

import { api, endpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
  const { user, checkSession } = useUser();
  const { showError, showSuccess } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('A imagem deve ter no máximo 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Formato não permitido. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await api.put(endpoints.person.avatar(Number(user.id)), { avatar: base64 });
      if (checkSession) {
        await checkSession();
      }
      showSuccess('Foto de perfil atualizada com sucesso');
    } catch {
      showError('Erro ao atualizar foto de perfil');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            hidden
            onChange={handleFileChange}
          />
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  width: 28,
                  height: 28,
                }}
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                <PencilIcon fontSize="var(--icon-fontSize-sm)" />
              </IconButton>
            }
          >
            <Avatar
              src={user?.avatar || '/assets/avatar.png'}
              sx={{ height: '80px', width: '80px', cursor: 'pointer' }}
              onClick={handleAvatarClick}
            />
          </Badge>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user?.name || 'Usuário'}</Typography>
            <Typography color="text.secondary" variant="body2">
              {user?.email || ''}
            </Typography>
            <Chip
              label={user?.role === 'teacher' ? 'Professor' : 'Aluno'}
              color={user?.role === 'teacher' ? 'primary' : 'secondary'}
              size="small"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
