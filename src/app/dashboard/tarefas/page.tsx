'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@mui/material';
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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { PencilSimple as PencilIcon, Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { api, endpoints, type ClassData, type ContentData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { FormDialog } from '@/components/dashboard/FormDialog';
import { HtmlContent } from '@/components/dashboard/html-content';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

const schema = zod.object({
  title: zod.string().min(1, 'Título é obrigatório'),
  subTitle: zod.string().optional(),
  message: zod.string().min(1, 'Descrição é obrigatória'),
  observation: zod.string().optional(),
  fk_class_id: zod.number().min(1, 'Turma é obrigatória'),
});

type Values = zod.infer<typeof schema>;

export default function TarefasPage(): React.JSX.Element {
  const { user } = useUser();
  const { showError } = useToast();
  const [tarefas, setTarefas] = React.useState<ContentData[]>([]);
  const [classes, setClasses] = React.useState<ClassData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [selectedTarefa, setSelectedTarefa] = React.useState<ContentData | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const isTeacher = user?.role === 'teacher';

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

  async function load() {
    try {
      const [tarefasData, classesData] = await Promise.all([
        api.get<ContentData[]>(endpoints.content.byType('tarefa')),
        isTeacher
          ? api.get<ClassData[]>(endpoints.dashboard.teacherClasses)
          : api.get<ClassData[]>(endpoints.dashboard.studentClasses),
      ]);
      setTarefas(tarefasData);
      setClasses(classesData);
    } catch (err) {
      showError('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [isTeacher]);

  const onSubmit = async (values: Values) => {
    setIsPending(true);
    try {
      if (editingId) {
        const updated = await api.put<ContentData>(endpoints.content.byId(editingId), values);
        setTarefas((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      } else {
        const newTarefa = await api.post<ContentData>(endpoints.content.base, { ...values, type: 'tarefa' });
        setTarefas((prev) => [newTarefa, ...prev]);
      }
      reset();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      showError(editingId ? 'Erro ao editar tarefa' : 'Erro ao criar tarefa');
    } finally {
      setIsPending(false);
    }
  };

  const handleEdit = (tarefa: ContentData) => {
    setEditingId(tarefa.id);
    setValue('title', tarefa.title);
    setValue('subTitle', tarefa.subTitle ?? '');
    setValue('message', tarefa.message);
    setValue('observation', tarefa.observation ?? '');
    setValue('fk_class_id', tarefa.fk_class_id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(endpoints.content.byId(deleteId));
      setTarefas((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showError('Erro ao excluir tarefa');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  const handleCardClick = (tarefa: ContentData) => {
    if (!isTeacher) {
      setSelectedTarefa(tarefa);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Tarefas</Typography>
        {isTeacher && (
          <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setShowForm(true)}>
            Nova Tarefa
          </Button>
        )}
      </Stack>

      <FormDialog
        open={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
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

      {tarefas.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Nenhuma tarefa encontrada.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tarefas.map((tarefa) => (
            <Grid key={tarefa.id} xs={12} md={6} lg={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: isTeacher ? 'default' : 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': isTeacher ? {} : { boxShadow: (theme) => theme.shadows[4] },
                }}
                onClick={() => handleCardClick(tarefa)}
              >
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6">{tarefa.title}</Typography>
                      {isTeacher && (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            color="warning"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(tarefa);
                            }}
                          >
                            <PencilIcon size={18} />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(tarefa.id);
                            }}
                          >
                            <TrashIcon size={18} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                    {tarefa.subTitle && (
                      <Typography color="text.secondary" variant="body2">
                        {tarefa.subTitle}
                      </Typography>
                    )}
                    <Chip label={tarefa.class.name} size="small" color="primary" variant="outlined" />
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
                      {tarefa.message.replace(/<[^>]*>/g, '')}
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
          <Typography>Tem certeza que deseja excluir esta tarefa?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={selectedTarefa !== null}
        onClose={() => setSelectedTarefa(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {selectedTarefa && (
          <>
            <DialogTitle>
              <Stack spacing={1}>
                <Typography variant="h5">{selectedTarefa.title}</Typography>
                {selectedTarefa.subTitle && (
                  <Typography color="text.secondary" variant="subtitle1">
                    {selectedTarefa.subTitle}
                  </Typography>
                )}
                <Chip
                  label={selectedTarefa.class.name}
                  size="small"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <HtmlContent html={selectedTarefa.message} />
              {selectedTarefa.observation && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Observação
                  </Typography>
                  <Typography variant="body2">{selectedTarefa.observation}</Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTarefa(null)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}
