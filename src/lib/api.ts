const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('custom-auth-token');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const authToken = token || this.getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(authToken || undefined),
        ...fetchOptions.headers,
      },
    });

    if (response.status === 401 && !endpoint.includes('/auth/me')) {
      localStorage.removeItem('custom-auth-token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/sign-in';
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const authToken = this.getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('custom-auth-token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/sign-in';
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro no upload');
    }

    return data as T;
  }
}

export const api = new ApiClient();

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
