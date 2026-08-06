'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';

import { api, endpoints, type ContentData, type PerformData, type QuestionData, type TestData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { HtmlContent } from '@/components/dashboard/html-content';
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

function parseOptions(optionsJson: string | null | undefined): { id: string; text: string }[] {
  if (!optionsJson) return [];
  try {
    return JSON.parse(optionsJson);
  } catch {
    return [];
  }
}

export default function RealizarTarefaPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const contentId = Number(params.contentId);

  const [content, setContent] = React.useState<ContentData | null>(null);
  const [test, setTest] = React.useState<TestData | null>(null);
  const [questions, setQuestions] = React.useState<QuestionData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const answersRef = React.useRef<Record<number, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<PerformData | null>(null);
  const [alreadyDone, setAlreadyDone] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const [tarefasData, performsData] = await Promise.all([
          api.get<ContentData[]>(endpoints.content.byType('tarefa')),
          api.get<PerformData[]>(endpoints.content.myPerforms).catch(() => []),
        ]);

        let foundContent: ContentData | null = null;
        let foundTest: TestData | null = null;

        for (const c of tarefasData) {
          if (c.id === contentId) {
            foundContent = c;
            if (c.Test && c.Test.length > 0) {
              foundTest = c.Test[0];
            }
            break;
          }
        }

        if (!foundContent) {
          showError('Tarefa não encontrada');
          router.push('/dashboard/tarefas');
          return;
        }

        if (!foundTest) {
          showError('Esta tarefa não possui questões');
          router.push('/dashboard/tarefas');
          return;
        }

          const testDone = performsData.some((p) => p.Test?.id === foundTest!.id);
        if (testDone) {
          setAlreadyDone(true);
          const existingPerform = performsData.find((p) => p.Test?.id === foundTest!.id);
          if (existingPerform) {
            setResult(existingPerform);
          }
          setContent(foundContent);
          setTest(foundTest);
          setQuestions(foundTest.Question || []);
          setLoading(false);
          return;
        }

        setContent(foundContent);
        setTest(foundTest);
        setQuestions(foundTest.Question || []);
      } catch {
        showError('Erro ao carregar tarefa');
        router.push('/dashboard/tarefas');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contentId, router, showError]);

  const handleAnswerChange = (questionId: number, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value };
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = React.useCallback(async () => {
    if (!test || submitting) return;
    setSubmitting(true);
    try {
      const latestAnswers = { ...answers, ...answersRef.current };
      const result = await api.post<PerformData>(endpoints.content.submitTest(test.id), {
        answers: latestAnswers,
      });
      setResult(result);
      showSuccess('Tarefa enviada com sucesso!');
    } catch {
      showError('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  }, [test, answers, submitting, showError, showSuccess]);

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
        <Typography>Carregando tarefa...</Typography>
      </Stack>
    );
  }

  if (result) {
    const parsedAnswers: Record<string, string> = result.answer ? JSON.parse(result.answer) : {};

    return (
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          variant="text"
          onClick={() => router.push('/dashboard/tarefas')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar
        </Button>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircle size={32} color="var(--mui-palette-success-main)" weight="fill" />
                <Typography variant="h5" color="success.main">
                  {alreadyDone ? 'Tarefa já realizada' : 'Tarefa enviada!'}
                </Typography>
              </Stack>

              <Typography variant="h6">{test?.title}</Typography>

              {result.score != null && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: (theme) => theme.palette.background.paper,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Sua nota
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    {String(result.score)}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Conteúdo da tarefa
                </Typography>
                <HtmlContent html={content?.message || ''} />
              </Box>

              <Divider />

              <Typography variant="subtitle1" fontWeight="bold">
                Suas respostas
              </Typography>

              {questions.map((q, i) => {
                const options = parseOptions(q.options);
                const studentAnswer = parsedAnswers[String(q.id)] || '';
                return (
                  <Box key={q.id}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {i + 1}. {q.title}
                    </Typography>
                    {q.type === 'multiple_choice' ? (
                      <Stack spacing={0.5} sx={{ pl: 2 }}>
                        {options.map((opt) => (
                          <Typography
                            key={opt.id}
                            variant="body2"
                            sx={{
                              fontWeight: opt.id === studentAnswer ? 'bold' : 'normal',
                              color: q.correct_answer === opt.id
                                ? 'success.main'
                                : opt.id === studentAnswer
                                  ? 'error.main'
                                  : 'text.primary',
                            }}
                          >
                            {opt.id.toUpperCase()}). {opt.text}
                            {q.correct_answer === opt.id && ' ✓'}
                            {opt.id === studentAnswer && q.correct_answer !== opt.id && ' ✗'}
                          </Typography>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ pl: 2 }}>
                        {studentAnswer ? (
                          <HtmlContent html={studentAnswer} />
                        ) : (
                          <Typography variant="body2">Sem resposta</Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        startIcon={<ArrowLeft size={18} />}
        variant="text"
        onClick={() => router.push('/dashboard/tarefas')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Voltar
      </Button>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={1}>
                <Typography variant="h5">{test?.title}</Typography>
                <Chip label="Tarefa" size="small" color="primary" variant="outlined" />
              </Stack>
            </Stack>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Conteúdo da tarefa
              </Typography>
              <HtmlContent html={content?.message || ''} />
            </Box>

            {content?.observation && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Observação
                </Typography>
                <Typography variant="body2">{content.observation}</Typography>
              </>
            )}

            <Divider />

            <Typography variant="subtitle1" fontWeight="bold">
              Questões ({questions.length})
            </Typography>

            {questions.length === 0 && (
              <Typography color="text.secondary">
                Esta tarefa não possui questões.
              </Typography>
            )}

            {questions.map((q, i) => {
              const options = parseOptions(q.options);
              const currentAnswer = answers[q.id] || '';

              return (
                <Box key={q.id}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    {i + 1}. {q.title}
                  </Typography>

                  {q.type === 'multiple_choice' ? (
                    <FormControl component="fieldset" error={false}>
                      <RadioGroup
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      >
                        <Stack spacing={0.5}>
                          {options.map((opt) => (
                            <FormControlLabel
                              key={opt.id}
                              value={opt.id}
                              control={<Radio size="small" />}
                              label={`${opt.id.toUpperCase()}). ${opt.text}`}
                            />
                          ))}
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  ) : (
                    <Box sx={{ '& .jodit': { minHeight: 120 } }}>
                      <Editor
                        content={currentAnswer}
                        handeChangeContent={(val) => handleAnswerChange(q.id, val)}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/dashboard/tarefas')}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || questions.length === 0}
              >
                {submitting ? 'Enviando...' : 'Enviar Tarefa'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
