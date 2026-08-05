export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  url_avatar?: string;
  phone?: string;
  created_at: string;
}

export interface ContentData {
  id: number;
  title: string;
  subTitle?: string;
  message: string;
  url?: string;
  observation?: string;
  type: string;
  created_at: string;
  fk_class_id: number;
  fk_teacher_id: number;
  teacher: {
    id: number;
    person: { name: string; email: string };
  };
  class: { id: number; name: string };
  Test: TestData[];
  Comment: CommentData[];
}

export interface TestData {
  id: number;
  title: string;
  observation?: string;
  timer_minutes: number;
  created_at: string;
  fk_content_id: number;
  Question?: QuestionData[];
}

export interface QuestionData {
  id: number;
  title: string;
  type: 'multiple_choice' | 'free_text';
  options?: string;
  correct_answer?: string;
  order: number;
  fk_test_id: number;
}

export interface CommentData {
  id: number;
  message: string;
  created_at: string;
  fk_student_id: number;
  fk_content_id: number;
  student: {
    id: number;
    person: { name: string; email: string };
  };
}

export interface PerformData {
  id: number;
  answer?: string;
  score?: number;
  created_at: string;
  test: TestData;
}

export interface DashboardTeacher {
  tarefas: number;
  leituras: number;
  provas: number;
  totalAlunos: number;
  totalTurmas: number;
  recentContents: ContentData[];
}

export interface DashboardStudent {
  tarefas: number;
  leituras: number;
  provas: number;
  provasRealizadas: number;
  totalTurmas: number;
  recentContents: ContentData[];
}

export interface ClassData {
  id: number;
  name: string;
  Bio?: string;
  _count?: { Study: number; Content: number };
  Study?: { studtent: StudentData }[];
}

export interface StudentData {
  id: number;
  active: boolean;
  bio?: string;
  fk_person_id: number;
  person: { id: number; name: string; email: string; phone?: string };
}
