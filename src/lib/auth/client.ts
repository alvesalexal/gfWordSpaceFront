'use client';

import type { User } from '@/types/user';
import { api, type AuthResponse } from '@/lib/api';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string; data?: AuthResponse }> {
    try {
      const result = await api.post<AuthResponse>('/auth/register', params);
      localStorage.setItem('custom-auth-token', result.token);
      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Erro ao cadastrar' };
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; data?: AuthResponse }> {
    try {
      const result = await api.post<AuthResponse>('/auth/login', params);
      localStorage.setItem('custom-auth-token', result.token);
      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Erro ao fazer login' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    try {
      const userData = await api.get<{
        id: number;
        name: string;
        email: string;
        role: string;
        url_avatar?: string;
        phone?: string;
      }>('/auth/me');

      return {
        data: {
          id: String(userData.id),
          name: userData.name,
          email: userData.email,
          avatar: userData.url_avatar || '/assets/avatar.png',
          role: userData.role,
          phone: userData.phone || '',
        },
      };
    } catch {
      localStorage.removeItem('custom-auth-token');
      return { data: null };
    }
  }

  async resetPassword(_params: { email: string }): Promise<{ error?: string; data?: { resetToken: string } }> {
    try {
      const result = await api.post<{ resetToken: string }>('/auth/forgot-password', _params);
      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Erro ao solicitar recuperação de senha' };
    }
  }

  async confirmPassword(params: { token: string; password: string }): Promise<{ error?: string; data?: { message: string } }> {
    try {
      const result = await api.post<{ message: string }>('/auth/reset-password', params);
      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Erro ao redefinir senha' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    return {};
  }
}

export const authClient = new AuthClient();
