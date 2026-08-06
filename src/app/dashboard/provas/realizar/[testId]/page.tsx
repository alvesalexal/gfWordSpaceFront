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
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft, CheckCircle, Timer as TimerIcon } from '@phosphor-icons/react';

import { api, endpoints, type ContentData, type PerformData, type QuestionData, type TestData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { HtmlContent } from '@/components/dashboard/html-content';
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

function Timer({
  minutes,
  onTimeUp,
}: {
  minutes: number;
  onTimeUp: () => void;
}): React.JSX.Element {
  const [secondsLeft, setSecondsLeft] = React.useState(minutes * 60);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = ((minutes * 60 - secondsLeft) / (minutes * 60)) * 100;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TimerIcon size={20} />
        <Typography variant="h5" color={secondsLeft < 60 ? 'error' : 'inherit'}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={secondsLeft < 60 ? 'error' : 'primary'}
      />
    </Stack>
  );
}

function parseOptions(optionsJson: string | null | undefined): { id: string; text: string }[] {
  if (!optionsJson) return [];
  try {
    return JSON.parse(optionsJson);
  } catch {
    return [];
  }
}

export default function RealizarProvaPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const testId = Number(params.testId);

  const [test, setTest] = React.useState<TestData | null>(null);
  const [content, setContent] = React.useState<ContentData | null>(null);
  const [questions, setQuestions] = React.useState<QuestionData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const answersRef = React.useRef<Record<number, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<PerformData | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [provasData, performsData] = await Promise.all([
          api.get<ContentData[]>(endpoints.content.byType('prova')),
          api.get<PerformData[]>(endpoints.content.myPerforms).catch(() => []),
        ]);

        const alreadyDone = performsData.some((p) => p.Test?.id === testId);
        if (alreadyDone) {
          showError('Esta prova já foi realizada e não pode ser refita');
          router.push('/dashboard/provas');
          return;
        }

        let foundTest: TestData | null = null;
        let foundContent: ContentData | null = null;

        for (const c of provasData) {
          const t = c.Test?.find((test) => test.id === testId);
          if (t) {
            foundTest = t;
            foundContent = c;
            break;
          }
        }

        if (!foundTest || !foundContent) {
          showError('Prova não encontrada');
          router.push('/dashboard/provas');
          return;
        }

        setTest(foundTest);
        setContent(foundContent);
        setQuestions(foundTest.Question || []);
      } catch {
        showError('Erro ao carregar prova');
        router.push('/dashboard/provas');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId, router, showError]);

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
      showSuccess('Prova enviada com sucesso!');
    } catch {
      showError('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  }, [test, answers, submitting, showError, showSuccess]);

  const handleTimeUp = React.useCallback(() => {
    const hasAnswers = Object.values(answers).some((v) => v?.trim());
    if (hasAnswers) {
      handleSubmit();
    } else {
      router.push('/dashboard/provas');
    }
  }, [answers, handleSubmit, router]);

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
        <Typography>Carregando prova...</Typography>
      </Stack>
    );
  }

  if (!test || !content) {
    return <></>;
  }

  if (result) {
    const parsedAnswers: Record<string, string> = result.answer ? JSON.parse(result.answer) : {};

    return (
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          variant="text"
          onClick={() => router.push('/dashboard/provas')}
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
                  Prova enviada!
                </Typography>
              </Stack>

              <Typography variant="h6">{test.title}</Typography>

              {result.score != null && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    //                    bgcolor: (theme) => theme.palette.background.paper,
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
                  Conteúdo da prova
                </Typography>
                <HtmlContent html={content.message} />
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
        onClick={() => router.push('/dashboard/provas')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Voltar
      </Button>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={1}>
                <Typography variant="h5">{test.title}</Typography>
                <Chip
                  label={`${test.timer_minutes} minutos`}
                  size="small"
                  icon={<TimerIcon size={14} />}
                />
              </Stack>
            </Stack>

            <Timer minutes={test.timer_minutes} onTimeUp={handleTimeUp} />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Conteúdo da prova
              </Typography>
              <HtmlContent html={content.message} />
            </Box>

            <Divider />

            <Typography variant="subtitle1" fontWeight="bold">
              Questões ({questions.length})
            </Typography>

            {questions.length === 0 && (
              <Typography color="text.secondary">
                Esta prova não possui questões.
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
                onClick={() => router.push('/dashboard/provas')}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || questions.length === 0}
              >
                {submitting ? 'Enviando...' : 'Enviar Prova'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
