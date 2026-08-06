'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { DashboardSkeleton } from '@/components/dashboard/skeletons';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { BookOpen, ClipboardText, FileText, GraduationCap, Users } from '@phosphor-icons/react';

import { api, endpoints, type ContentData, type DashboardStudent, type DashboardTeacher } from '@/lib/api';
import { useUser } from '@/hooks/use-user';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps): React.JSX.Element {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: color,
              color: 'common.white',
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4">{value}</Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecentContents({ contents }: { contents: ContentData[] }): React.JSX.Element {
  if (contents.length === 0) {
    return (
      <Card>
        <CardHeader title="Conteúdos Recentes" />
        <CardContent>
          <Typography color="text.secondary">Nenhum conteúdo recente.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Conteúdos Recentes" />
      <CardContent>
        <Stack spacing={2}>
          {contents.map((content) => (
            <Box key={content.id} sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
              <Typography variant="subtitle1">{content.title}</Typography>
              <Typography color="text.secondary" variant="body2">
                {content.type === 'tarefa' ? 'Tarefa' : content.type === 'leitura' ? 'Leitura' : 'Prova'} -{' '}
                {content.class.name}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage(): React.JSX.Element {
  const { user } = useUser();
  const [teacherData, setTeacherData] = React.useState<DashboardTeacher | null>(null);
  const [studentData, setStudentData] = React.useState<DashboardStudent | null>(null);
  const [loading, setLoading] = React.useState(true);

  const isTeacher = user?.role === 'teacher';

  React.useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        if (isTeacher) {
          const data = await api.get<DashboardTeacher>(endpoints.dashboard.teacher);
          setTeacherData(data);
        } else {
          const data = await api.get<DashboardStudent>(endpoints.dashboard.student);
          setStudentData(data);
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isTeacher]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isTeacher && teacherData) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Dashboard do Professor</Typography>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Tarefas" value={teacherData.tarefas} icon={<ClipboardText size={28} />} color="primary.main" />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Leituras" value={teacherData.leituras} icon={<BookOpen size={28} />} color="success.main" />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Provas" value={teacherData.provas} icon={<FileText size={28} />} color="warning.main" />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Alunos" value={teacherData.totalAlunos} icon={<Users size={28} />} color="secondary.main" />
          </Grid>
        </Grid>
        <RecentContents contents={teacherData.recentContents} />
      </Stack>
    );
  }

  if (studentData) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Dashboard do Aluno</Typography>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Tarefas" value={studentData.tarefas} icon={<ClipboardText size={28} />} color="primary.main" />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Leituras" value={studentData.leituras} icon={<BookOpen size={28} />} color="success.main" />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard title="Provas" value={studentData.provas} icon={<FileText size={28} />} color="warning.main" />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <StatCard
              title="Provas Realizadas"
              value={studentData.provasRealizadas}
              icon={<GraduationCap size={28} />}
              color="secondary.main"
            />
          </Grid>
        </Grid>
        <RecentContents contents={studentData.recentContents} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Bem-vindo ao WordSpace</Typography>
      <Card>
        <CardContent>
          <Typography>Para começar, entre em uma turma ou aguarde o professor adicioná-la.</Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
