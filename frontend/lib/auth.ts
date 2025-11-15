import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  role: 'end_user' | 'admin';
  emailVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async signup(email: string, password?: string): Promise<void> {
    await api.post('/auth/signup', { email, password });
  },

  async verifyEmail(email: string, otp: string): Promise<void> {
    await api.post('/auth/verify-email', { email, otp });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 7 });
    }
    return response.data;
  },

  async requestMagicLink(email: string): Promise<void> {
    await api.post('/auth/magic-link', { email });
  },

  async verifyMagicLink(email: string, token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-magic-link', {
      email,
      token,
    });
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 7 });
    }
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(
    email: string,
    token: string,
    password: string
  ): Promise<void> {
    await api.post('/auth/reset-password', { email, token, password });
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  logout(): void {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },
};

