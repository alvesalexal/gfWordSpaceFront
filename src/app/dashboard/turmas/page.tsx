'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Pencil as PencilIcon, Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { api, endpoints, type ClassData, type StudentData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { FormDialog } from '@/components/dashboard/FormDialog';

const schema = zod.object({
  name: zod.string().min(1, 'Nome da turma é obrigatório'),
  bio: zod.string().optional(),
  studentIds: zod.array(zod.number()).default([]),
});

type Values = zod.infer<typeof schema>;

export default function TurmasPage(): React.JSX.Element {
  const { user } = useUser();
  const { showError, showSuccess } = useToast();
  const [turmas, setTurmas] = React.useState<ClassData[]>([]);
  const [students, setStudents] = React.useState<StudentData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Values>({
    defaultValues: { name: '', bio: '', studentIds: [] },
    resolver: zodResolver(schema),
  });

  const loadClasses = React.useCallback(async () => {
    try {
      const data = await api.get<ClassData[]>(endpoints.dashboard.classes);
      setTurmas(data);
    } catch (err) {
      showError('Erro ao carregar turmas');
    }
  }, []);

  React.useEffect(() => {
    async function load() {
      try {
        const [turmasData, studentsData] = await Promise.all([
          api.get<ClassData[]>(endpoints.dashboard.classes),
          isTeacher ? api.get<StudentData[]>(endpoints.dashboard.students) : Promise.resolve([]),
        ]);
        setTurmas(turmasData);
        setStudents(studentsData);
      } catch (err) {
        showError('Erro ao carregar turmas');
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
        await api.put<ClassData>(endpoints.dashboard.classes + `/${editingId}`, values);
      } else {
        await api.post<ClassData>(endpoints.dashboard.classes, values);
      }
      await loadClasses();
      reset();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      showError(editingId ? 'Erro ao editar turma' : 'Erro ao criar turma');
    } finally {
      setIsPending(false);
    }
  };

  const handleEdit = (turma: ClassData) => {
    setEditingId(turma.id);
    setValue('name', turma.name);
    setValue('bio', turma.Bio || '');
    const enrolledIds = turma.Study?.map((s) => s.studtent.id) || [];
    setValue('studentIds', enrolledIds);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(endpoints.dashboard.classes + `/${deleteId}`);
      setTurmas((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showError('Erro ao excluir turma');
    }
  };

  const handleEnroll = async (classId: number) => {
    try {
      await api.post(endpoints.dashboard.enroll, { fk_class_id: classId });
      showSuccess('Matriculado com sucesso!');
      await loadClasses();
    } catch (err) {
      showError('Erro ao matricular');
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Turmas</Typography>
        {isTeacher && (
          <Button
            startIcon={<PlusIcon />}
            variant="contained"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              reset();
            }}
          >
            Nova Turma
          </Button>
        )}
      </Stack>

      <FormDialog
        open={showForm}
        onClose={handleCancel}
        title={editingId ? 'Editar Turma' : 'Nova Turma'}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isPending}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome da Turma"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="bio"
            render={({ field }) => <TextField {...field} label="Descrição (opcional)" multiline rows={2} />}
          />
          <Controller
            control={control}
            name="studentIds"
            render={({ field }) => (
              <Autocomplete
                multiple
                options={students}
                value={students.filter((s) => field.value.includes(s.id))}
                onChange={(_, newValue) => {
                  field.onChange(newValue.map((s) => s.id));
                }}
                getOptionLabel={(option) => option.person.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.id}>
                    <Checkbox checked={selected} />
                    <Stack direction="column">
                      <Typography variant="body2">{option.person.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.person.email}
                      </Typography>
                    </Stack>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.person.name}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Selecionar Alunos" placeholder="Buscar aluno..." />
                )}
              />
            )}
          />
        </Stack>
      </FormDialog>

      {turmas.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Nenhuma turma encontrada.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {turmas.map((turma) => (
            <Grid key={turma.id} xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6">{turma.name}</Typography>
                      {isTeacher && (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton color="primary" size="small" onClick={() => handleEdit(turma)}>
                            <PencilIcon size={18} />
                          </IconButton>
                          <IconButton color="error" size="small" onClick={() => setDeleteId(turma.id)}>
                            <TrashIcon size={18} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                    {turma.Bio && (
                      <Typography color="text.secondary" variant="body2">
                        {turma.Bio}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1}>
                      {turma._count && (
                        <>
                          <Chip
                            label={`${turma._count.Study} aluno(s)`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${turma._count.Content} conteúdo(s)`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </>
                      )}
                    </Stack>
                    {isStudent && (
                      <Button variant="outlined" size="small" onClick={() => handleEnroll(turma.id)}>
                        Entrar na turma
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination count={1} size="small" />
      </Box>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir esta turma?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
