'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { GridCardsSkeleton } from '@/components/dashboard/skeletons';
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
  const { showError, showSuccess } = useToast();
  const [leituras, setLeituras] = React.useState<ContentData[]>([]);
  const [classes, setClasses] = React.useState<ClassData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCommenting, setIsCommenting] = React.useState(false);
  const [selectedLeitura, setSelectedLeitura] = React.useState<ContentData | null>(null);
  const leiturasRef = React.useRef(leituras);
  leiturasRef.current = leituras;
  const [commentText, setCommentText] = React.useState('');
  const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = React.useState('');
  const [isEditingComment, setIsEditingComment] = React.useState(false);
  const [deletingCommentId, setDeletingCommentId] = React.useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = React.useState(false);

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

  React.useEffect(() => {
    if (!user) return;
    load();
  }, [user, isTeacher]);

  const onSubmit = async (values: Values) => {
    setIsPending(true);
    try {
      if (editingId) {
        await api.put<ContentData>(endpoints.content.byId(editingId), values);
      } else {
        await api.post<ContentData>(endpoints.content.base, { ...values, type: 'leitura' });
      }
      await load();
      reset();
      setShowForm(false);
      showSuccess(editingId ? 'Leitura editada com sucesso!' : 'Leitura criada com sucesso!');
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
    setIsDeleting(true);
    try {
      await api.delete(endpoints.content.byId(deleteId));
      await load();
      showSuccess('Leitura excluída com sucesso!');
      setDeleteId(null);
    } catch (err) {
      showError('Erro ao excluir leitura');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedLeitura || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      const newComment = await api.post<CommentData>(endpoints.content.comment(selectedLeitura.id), {
        message: commentText.trim(),
      });
      setSelectedLeitura((prev) =>
        prev ? { ...prev, Comment: [newComment, ...(prev.Comment || [])] } : prev
      );
      setLeituras((prev) =>
        prev.map((l) =>
          l.id === selectedLeitura.id
            ? { ...l, Comment: [newComment, ...(l.Comment || [])] }
            : l
        )
      );
      showSuccess('Comentário adicionado com sucesso!');
      setCommentText('');
    } catch (err) {
      showError('Erro ao adicionar comentário');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editingCommentText.trim() || !selectedLeitura) return;
    setIsEditingComment(true);
    try {
      const updatedComment = await api.put<CommentData>(endpoints.content.commentUpdate(commentId), {
        message: editingCommentText.trim(),
      });
      setSelectedLeitura((prev) =>
        prev
          ? {
              ...prev,
              Comment: (prev.Comment || []).map((c) =>
                c.id === commentId ? { ...c, message: updatedComment.message, updated_at: updatedComment.updated_at } : c
              ),
            }
          : prev
      );
      setLeituras((prev) =>
        prev.map((l) =>
          l.id === selectedLeitura.id
            ? {
                ...l,
                Comment: (l.Comment || []).map((c) =>
                  c.id === commentId ? { ...c, message: updatedComment.message, updated_at: updatedComment.updated_at } : c
                ),
              }
            : l
        )
      );
      showSuccess('Comentário atualizado com sucesso!');
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err) {
      showError('Erro ao editar comentário');
    } finally {
      setIsEditingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingCommentId || !selectedLeitura) return;
    setIsDeletingComment(true);
    try {
      await api.delete(endpoints.content.commentDelete(deletingCommentId));
      setSelectedLeitura((prev) =>
        prev
          ? { ...prev, Comment: (prev.Comment || []).filter((c) => c.id !== deletingCommentId) }
          : prev
      );
      setLeituras((prev) =>
        prev.map((l) =>
          l.id === selectedLeitura.id
            ? { ...l, Comment: (l.Comment || []).filter((c) => c.id !== deletingCommentId) }
            : l
        )
      );
      showSuccess('Comentário excluído com sucesso!');
      setDeletingCommentId(null);
    } catch (err) {
      showError('Erro ao excluir comentário');
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  if (loading) {
    return <GridCardsSkeleton />;
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
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setSelectedLeitura(leitura)}>
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6">{leitura.title}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedLeitura(leitura); }}>
                          <ChatCircle size={18} />
                        </IconButton>
                        {isTeacher && (
                          <>
                            <IconButton color="warning" size="small" onClick={(e) => { e.stopPropagation(); handleEdit(leitura); }}>
                              <PencilIcon size={18} />
                            </IconButton>
                            <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); setDeleteId(leitura.id); }}>
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
                    <Chip label={leitura.Class.name} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: 24, width: 'fit-content' }} />
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
        <DialogTitle sx={{ px: 3, py: 2 }}>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir esta leitura?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDeleteId(null)} disabled={isDeleting} sx={{ px: 4 }}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" color="error" onClick={handleDelete} loading={isDeleting} sx={{ px: 4 }}>
            Excluir
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={selectedLeitura !== null} onClose={() => setSelectedLeitura(null)} maxWidth="lg" fullWidth>
        {selectedLeitura && (
          <>
            <DialogTitle sx={{ px: 3, py: 2 }}>{selectedLeitura.title}</DialogTitle>
            <DialogContent>
              <HtmlContent html={selectedLeitura.message} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Comentários
              </Typography>
              {(isStudent || isTeacher) && (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    placeholder="Escreva um comentário..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Stack direction="row" justifyContent="flex-end">
                    <LoadingButton variant="contained" onClick={handleAddComment} disabled={!commentText.trim()} loading={isCommenting} sx={{ px: 4 }}>
                      Enviar
                    </LoadingButton>
                  </Stack>
                </Stack>
              )}
              <List>
                {(selectedLeitura.Comment || []).map((comment) => {
                  const isStudentComment = !!comment.fk_student_id;
                  const isTeacherComment = !!comment.fk_teacher_id;
                  const isOwner = isStudent && isStudentComment && user && comment.Student?.Person.id === Number(user.id);
                  const isTeacherOwner = isTeacher && isTeacherComment && user && comment.Teacher?.Person.id === Number(user.id);
                  const canDelete = isStudent ? isOwner : isTeacher && (isStudentComment || isTeacherOwner);
                  const canEdit = isStudent ? isOwner : isTeacherOwner;
                  const authorName = comment.Student?.Person?.name || comment.Teacher?.Person?.name || 'Autor desconhecido';
                  return (
                    <ListItem
                      key={comment.id}
                      alignItems="flex-start"
                      secondaryAction={
                        (canEdit || canDelete) && editingCommentId !== comment.id ? (
                          <Stack direction="row" spacing={0.5}>
                            {canEdit && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingCommentText(comment.message);
                                }}
                              >
                                <PencilIcon fontSize={14} />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeletingCommentId(comment.id)}
                              >
                                <TrashIcon fontSize={14} />
                              </IconButton>
                            )}
                          </Stack>
                        ) : undefined
                      }
                    >
                      {editingCommentId === comment.id ? (
                        <Stack spacing={1} sx={{ width: '100%' }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                          />
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentText('');
                              }}
                              disabled={isEditingComment}
                            >
                              Cancelar
                            </Button>
                            <LoadingButton
                              size="small"
                              variant="contained"
                              onClick={() => handleEditComment(comment.id)}
                              disabled={!editingCommentText.trim()}
                              loading={isEditingComment}
                            >
                              Salvar
                            </LoadingButton>
                          </Stack>
                        </Stack>
                      ) : (
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography component="span" variant="body2" fontWeight={isTeacherComment ? 600 : 400}>
                                {authorName}
                              </Typography>
                              {isTeacherComment && (
                                <Chip label="Professor" size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.6rem', height: 18 }} />
                              )}
                            </Stack>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {comment.message}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleString('pt-BR', { timeZone: 'UTC' })}
                                {comment.updated_at && ' (editado)'}
                              </Typography>
                            </>
                          }
                        />
                      )}
                    </ListItem>
                  );
                })}
                {(!selectedLeitura.Comment || selectedLeitura.Comment.length === 0) && (
                  <Typography color="text.secondary" variant="body2" sx={{ p: 2 }}>
                    Nenhum comentário ainda.
                  </Typography>
                )}
              </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant="outlined" onClick={() => setSelectedLeitura(null)} sx={{ px: 4 }}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={deletingCommentId !== null} onClose={() => setDeletingCommentId(null)}>
        <DialogTitle sx={{ px: 3, py: 2 }}>Excluir comentário</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este comentário?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDeletingCommentId(null)} disabled={isDeletingComment} sx={{ px: 4 }}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" color="error" onClick={handleDeleteComment} loading={isDeletingComment} sx={{ px: 4 }}>
            Excluir
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
