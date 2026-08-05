'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { LoadingButton } from '@/components/core/loading-button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import {
  CheckCircle,
  Clock,
  ListNumbers,
  PencilSimple as PencilIcon,
  PlayCircle,
  Plus as PlusIcon,
  Trash as TrashIcon,
  X as XIcon,
} from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { api, endpoints, type ClassData, type ContentData, type PerformData, type QuestionData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { HtmlContent } from '@/components/dashboard/html-content';
import { paths } from '@/paths';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

interface QuestionForm {
  title: string;
  type: 'multiple_choice' | 'free_text';
  options: { id: string; text: string }[];
  correct_answer: string;
}

interface TarefaFormValues {
  title: string;
  subTitle: string;
  message: string;
  observation: string;
  fk_class_id: number;
}

const tarefaSchema = zod.object({
  title: zod.string().min(1, 'Título é obrigatório'),
  subTitle: zod.string().optional(),
  message: zod.string().min(1, 'Descrição é obrigatória'),
  observation: zod.string().optional(),
  fk_class_id: zod.number().min(1, 'Turma é obrigatória'),
});

function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
}: {
  question: QuestionForm;
  index: number;
  onUpdate: (data: Partial<QuestionForm>) => void;
  onDelete: () => void;
}): React.JSX.Element {
  const addOption = () => {
    const newId = String.fromCharCode(97 + question.options.length);
    onUpdate({ options: [...question.options, { id: newId, text: '' }] });
  };

  const updateOption = (optIndex: number, text: string) => {
    const newOptions = [...question.options];
    newOptions[optIndex] = { ...newOptions[optIndex], text };
    onUpdate({ options: newOptions });
  };

  const removeOption = (optIndex: number) => {
    const removed = question.options[optIndex];
    const newOptions = question.options
      .filter((_, i) => i !== optIndex)
      .map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
    onUpdate({
      options: newOptions,
      correct_answer: question.correct_answer === removed?.id ? '' : question.correct_answer,
    });
  };

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Questão {index + 1}
          </Typography>
          <IconButton color="error" size="small" onClick={onDelete}>
            <TrashIcon size={16} />
          </IconButton>
        </Stack>

        <TextField
          fullWidth
          label="Título da questão"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          size="small"
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={question.type}
            label="Tipo"
            onChange={(e) => onUpdate({ type: e.target.value as 'multiple_choice' | 'free_text' })}
          >
            <MenuItem value="multiple_choice">Múltipla Escolha</MenuItem>
            <MenuItem value="free_text">Texto Livre</MenuItem>
          </Select>
        </FormControl>

        {question.type === 'multiple_choice' && (
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" color="text.secondary">
                Opções
              </Typography>
              <Button size="small" startIcon={<PlusIcon size={14} />} onClick={addOption}>
                Adicionar opção
              </Button>
            </Stack>

            <RadioGroup value={question.correct_answer} onChange={(e) => onUpdate({ correct_answer: e.target.value })}>
              <Stack spacing={1}>
                {question.options.map((opt, optIdx) => (
                  <Stack key={opt.id} direction="row" spacing={1} alignItems="center">
                    <FormControlLabel value={opt.id} control={<Radio size="small" />} label="" sx={{ m: 0 }} />
                    <Typography variant="body2" sx={{ minWidth: 24, fontWeight: 'bold' }}>
                      {opt.id.toUpperCase()}).
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Opção ${opt.id.toUpperCase()}`}
                      value={opt.text}
                      onChange={(e) => updateOption(optIdx, e.target.value)}
                    />
                    <IconButton size="small" onClick={() => removeOption(optIdx)}>
                      <XIcon size={14} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </RadioGroup>

            {question.options.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Selecione a resposta correta clicando no radio acima
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export default function TarefasPage(): React.JSX.Element {
  const { user } = useUser();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [tarefas, setTarefas] = React.useState<ContentData[]>([]);
  const [classes, setClasses] = React.useState<ClassData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [performs, setPerforms] = React.useState<PerformData[]>([]);

  const [showForm, setShowForm] = React.useState(false);
  const [editingContent, setEditingContent] = React.useState<ContentData | null>(null);
  const [questions, setQuestions] = React.useState<QuestionForm[]>([]);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const performMap = React.useMemo(() => {
    const map = new Map<number, PerformData>();
    for (const p of performs) {
      if (p.test?.id) map.set(p.test.id, p);
    }
    return map;
  }, [performs]);

  const completedTestIds = React.useMemo(() => {
    return new Set(performs.map((p) => p.test?.id).filter(Boolean));
  }, [performs]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TarefaFormValues>({
    defaultValues: { title: '', subTitle: '', message: '', observation: '', fk_class_id: 0 },
    resolver: zodResolver(tarefaSchema),
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

      if (isStudent) {
        try {
          const performsData = await api.get<PerformData[]>(endpoints.content.myPerforms);
          setPerforms(performsData);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      showError('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [isTeacher]);

  const onSubmit = async (values: TarefaFormValues) => {
    setIsPending(true);
    try {
      const payload = {
        ...values,
        type: 'tarefa',
        questions: questions.map((q, i) => ({
          title: q.title,
          type: q.type,
          options: q.type === 'multiple_choice' ? JSON.stringify(q.options) : null,
          correct_answer: q.type === 'multiple_choice' ? q.correct_answer || null : null,
          order: i,
        })),
      };

      if (editingContent) {
        await api.put(endpoints.content.fullTestById(editingContent.id), payload);
      } else {
        await api.post(endpoints.content.fullTest, payload);
      }

      const tarefasData = await api.get<ContentData[]>(endpoints.content.byType('tarefa'));
      setTarefas(tarefasData);
      closeForm();
      showSuccess(editingContent ? 'Tarefa editada com sucesso!' : 'Tarefa criada com sucesso!');
    } catch {
      showError(editingContent ? 'Erro ao editar tarefa' : 'Erro ao criar tarefa');
    } finally {
      setIsPending(false);
    }
  };

  const openNewForm = () => {
    setEditingContent(null);
    setQuestions([]);
    reset({ title: '', subTitle: '', message: '', observation: '', fk_class_id: 0 });
    setShowForm(true);
  };

  const openEditForm = (content: ContentData) => {
    setEditingContent(content);
    reset({
      title: content.title,
      subTitle: content.subTitle || '',
      message: content.message,
      observation: content.observation || '',
      fk_class_id: content.fk_class_id,
    });

    const testQuestions = content.Test?.[0]?.Question || [];
    setQuestions(
      testQuestions.map((q) => ({
        title: q.title,
        type: q.type as 'multiple_choice' | 'free_text',
        options: q.options ? JSON.parse(q.options) : [],
        correct_answer: q.correct_answer || '',
      }))
    );
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContent(null);
    setQuestions([]);
    reset();
  };

  const addQuestion = () => {
    setQuestions([...questions, { title: '', type: 'multiple_choice', options: [], correct_answer: '' }]);
  };

  const updateQuestion = (index: number, data: Partial<QuestionForm>) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...data } : q)));
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(endpoints.content.byId(deleteId));
      setTarefas((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showError('Erro ao excluir tarefa');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (tarefa: ContentData) => {
    if (!isTeacher) {
      if (tarefa.Test && tarefa.Test.length > 0) {
        router.push(paths.dashboard.realizarTarefa(tarefa.id));
      } else {
        setSelectedTarefa(tarefa);
      }
    }
  };

  const [selectedTarefa, setSelectedTarefa] = React.useState<ContentData | null>(null);

  const totalQuestions = (test: { Question?: QuestionData[] }) => test.Question?.length || 0;

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Tarefas</Typography>
        {isTeacher && (
          <Button startIcon={<PlusIcon />} variant="contained" onClick={openNewForm}>
            Nova Tarefa
          </Button>
        )}
      </Stack>

      <Dialog open={showForm} onClose={closeForm} maxWidth="md" fullWidth scroll="paper">
        <form
          id="tarefa-form"
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          <DialogTitle>{editingContent ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <Stack spacing={2}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Título da tarefa"
                      error={Boolean(errors.title)}
                      helperText={errors.title?.message}
                      size="small"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="subTitle"
                  render={({ field }) => <TextField {...field} label="Subtítulo (opcional)" size="small" />}
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
                  render={({ field }) => <TextField {...field} label="Observação (opcional)" size="small" />}
                />
                <Controller
                  control={control}
                  name="fk_class_id"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.fk_class_id)} size="small" sx={{ minWidth: 200 }}>
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

              <Divider />

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Questões ({questions.length})
                  </Typography>
                  <Button startIcon={<PlusIcon size={16} />} variant="outlined" size="small" onClick={addQuestion}>
                    Adicionar Questão
                  </Button>
                </Stack>

                {questions.length === 0 && (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <ListNumbers size={40} color="var(--mui-palette-text-secondary)" />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Nenhuma questão adicionada.
                    </Typography>
                  </Box>
                )}

                {questions.map((q, i) => (
                  <QuestionEditor
                    key={i}
                    question={q}
                    index={i}
                    onUpdate={(data) => updateQuestion(i, data)}
                    onDelete={() => deleteQuestion(i)}
                  />
                ))}
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeForm} disabled={isPending}>
              Cancelar
            </Button>
            <LoadingButton variant="contained" type="submit" form="tarefa-form" loading={isPending}>
              {editingContent ? 'Salvar Alterações' : 'Criar Tarefa'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

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
                              openEditForm(tarefa);
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

                    {tarefa.Test && tarefa.Test.length > 0 && (
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {tarefa.Test.map((test) => {
                          const isCompleted = completedTestIds.has(test.id);
                          const qCount = totalQuestions(test);
                          return (
                            <Stack
                              key={test.id}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                {isStudent &&
                                  (isCompleted ? (
                                    <CheckCircle size={18} color="var(--mui-palette-success-main)" weight="fill" />
                                  ) : (
                                    <Clock size={18} color="var(--mui-palette-error-main)" weight="fill" />
                                  ))}
                                <Chip label="Tarefa" size="small" color={isCompleted ? 'success' : 'default'} variant={isCompleted ? 'filled' : 'outlined'} />
                                {qCount > 0 && (
                                  <Chip
                                    label={`${qCount} quest${qCount > 1 ? 'ões' : 'ão'}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                              {isStudent &&
                                (isCompleted ? (
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Chip
                                      label={`Nota: ${performMap.get(test.id)?.score ?? '-'}`}
                                      size="small"
                                      color="success"
                                      variant="filled"
                                      sx={{ fontWeight: 'bold' }}
                                    />
                                    <IconButton
                                      color="success"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(paths.dashboard.realizarTarefa(tarefa.id));
                                      }}
                                      title="Visualizar tarefa"
                                    >
                                      <CheckCircle size={20} weight="fill" />
                                    </IconButton>
                                  </Stack>
                                ) : (
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(paths.dashboard.realizarTarefa(tarefa.id));
                                    }}
                                    title="Realizar tarefa"
                                  >
                                    <PlayCircle size={22} weight="fill" />
                                  </IconButton>
                                ))}
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
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
          <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancelar
          </Button>
          <LoadingButton color="error" onClick={handleDelete} loading={isDeleting}>
            Excluir
          </LoadingButton>
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
