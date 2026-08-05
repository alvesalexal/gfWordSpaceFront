const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

type LoadingCallback = (loading: boolean) => void;

class ApiClient {
  private loadingCallbacks: Set<LoadingCallback> = new Set();

  onLoadingChange(callback: LoadingCallback): () => void {
    this.loadingCallbacks.add(callback);
    return () => {
      this.loadingCallbacks.delete(callback);
    };
  }

  private setLoading(loading: boolean): void {
    this.loadingCallbacks.forEach((callback) => callback(loading));
  }

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

    this.setLoading(true);
    try {
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
    } finally {
      this.setLoading(false);
    }
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

    this.setLoading(true);
    try {
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
    } finally {
      this.setLoading(false);
    }
  }
}

export const api = new ApiClient();
