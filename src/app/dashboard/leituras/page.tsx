'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { ChatCircle, PencilSimple as PencilIcon, Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { api, endpoints, type ClassData, type CommentData, type ContentData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { FormDialog } from '@/components/dashboard/FormDialog';
import { HtmlContent } from '@/components/dashboard/html-content';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

const schema = zod.object({
  title: zod.string().min(1, 'Título é obrigatório'),
  subTitle: zod.string().optional(),
  message: zod.string().min(1, 'Conteúdo é obrigatório'),
  observation: zod.string().optional(),
  fk_class_id: zod.number().min(1, 'Turma é obrigatória'),
});

type Values = zod.infer<typeof schema>;

export default function LeiturasPage(): React.JSX.Element {
  const { user } = useUser();
  const { showError } = useToast();
  const [leituras, setLeituras] = React.useState<ContentData[]>([]);
  const [classes, setClasses] = React.useState<ClassData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [selectedLeitura, setSelectedLeitura] = React.useState<ContentData | null>(null);
  const [commentText, setCommentText] = React.useState('');

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { title: '', subTitle: '', message: '', observation: '', fk_class_id: 0 },
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    async function load() {
      try {
        const [leiturasData, classesData] = await Promise.all([
          api.get<ContentData[]>(endpoints.content.byType('leitura')),
          isTeacher
            ? api.get<ClassData[]>(endpoints.dashboard.teacherClasses)
            : api.get<ClassData[]>(endpoints.dashboard.studentClasses),
        ]);
        setLeituras(leiturasData);
        setClasses(classesData);
      } catch (err) {
        showError('Erro ao carregar leituras');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isTeacher]);

  const onSubmit = async (values: Values) => {
    setIsPending(true);
    try {
      if (editingId) {
        const updated = await api.put<ContentData>(endpoints.content.byId(editingId), values);
        setLeituras((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
      } else {
        const newLeitura = await api.post<ContentData>(endpoints.content.base, { ...values, type: 'leitura' });
        setLeituras((prev) => [newLeitura, ...prev]);
      }
      reset();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      showError(editingId ? 'Erro ao editar leitura' : 'Erro ao criar leitura');
    } finally {
      setIsPending(false);
    }
  };

  const handleEdit = (leitura: ContentData) => {
    setEditingId(leitura.id);
    setValue('title', leitura.title);
    setValue('subTitle', leitura.subTitle ?? '');
    setValue('message', leitura.message);
    setValue('observation', leitura.observation ?? '');
    setValue('fk_class_id', leitura.fk_class_id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(endpoints.content.byId(deleteId));
      setLeituras((prev) => prev.filter((l) => l.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showError('Erro ao excluir leitura');
    }
  };

  const handleAddComment = async () => {
    if (!selectedLeitura || !commentText.trim()) return;
    try {
      const newComment = await api.post<CommentData>(endpoints.content.comment(selectedLeitura.id), {
        message: commentText.trim(),
      });
      setSelectedLeitura((prev) => (prev ? { ...prev, Comment: [newComment, ...(prev.Comment || [])] } : prev));
      setCommentText('');
    } catch (err) {
      showError('Erro ao adicionar comentário');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Leituras</Typography>
        {isTeacher && (
          <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setShowForm(true)}>
            Nova Leitura
          </Button>
        )}
      </Stack>

      <FormDialog
        open={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Editar Leitura' : 'Nova Leitura'}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isPending}
        maxWidth="lg"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField {...field} label="Título" error={Boolean(errors.title)} helperText={errors.title?.message} />
            )}
          />
          <Controller
            control={control}
            name="subTitle"
            render={({ field }) => <TextField {...field} label="Subtítulo (opcional)" />}
          />
          <Controller
            control={control}
            name="message"
            render={({ field }) => (
              <FormControl error={Boolean(errors.message)} sx={{ width: '100%' }}>
                <Editor content={field.value} handeChangeContent={(val) => field.onChange(val)} />
                {errors.message ? <FormHelperText>{errors.message.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="observation"
            render={({ field }) => <TextField {...field} label="Observação (opcional)" />}
          />
          <Controller
            control={control}
            name="fk_class_id"
            render={({ field }) => (
              <FormControl error={Boolean(errors.fk_class_id)}>
                <InputLabel>Turma</InputLabel>
                <Select
                  {...field}
                  value={field.value || ''}
                  label="Turma"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.fk_class_id ? <FormHelperText>{errors.fk_class_id.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
        </Stack>
      </FormDialog>

      {leituras.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Nenhuma leitura encontrada.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {leituras.map((leitura) => (
            <Grid key={leitura.id} xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6">{leitura.title}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => setSelectedLeitura(leitura)}>
                          <ChatCircle size={18} />
                        </IconButton>
                        {isTeacher && (
                          <>
                            <IconButton color="warning" size="small" onClick={() => handleEdit(leitura)}>
                              <PencilIcon size={18} />
                            </IconButton>
                            <IconButton color="error" size="small" onClick={() => setDeleteId(leitura.id)}>
                              <TrashIcon size={18} />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </Stack>
                    {leitura.subTitle && (
                      <Typography color="text.secondary" variant="body2">
                        {leitura.subTitle}
                      </Typography>
                    )}
                    <Chip label={leitura.class.name} size="small" color="primary" variant="outlined" />
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {leitura.message.replace(/<[^>]*>/g, '')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {leitura.Comment?.length || 0} comentário(s)
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir esta leitura?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={selectedLeitura !== null} onClose={() => setSelectedLeitura(null)} maxWidth="lg" fullWidth>
        {selectedLeitura && (
          <>
            <DialogTitle>{selectedLeitura.title}</DialogTitle>
            <DialogContent>
              <HtmlContent html={selectedLeitura.message} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Comentários
              </Typography>
              {isStudent && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <OutlinedInput
                    fullWidth
                    size="small"
                    placeholder="Escreva um comentário..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button variant="contained" onClick={handleAddComment} disabled={!commentText.trim()}>
                    Enviar
                  </Button>
                </Stack>
              )}
              <List>
                {(selectedLeitura.Comment || []).map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemText
                      primary={comment.student.person.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {comment.message}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {(!selectedLeitura.Comment || selectedLeitura.Comment.length === 0) && (
                  <Typography color="text.secondary" variant="body2" sx={{ p: 2 }}>
                    Nenhum comentário ainda.
                  </Typography>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedLeitura(null)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}
