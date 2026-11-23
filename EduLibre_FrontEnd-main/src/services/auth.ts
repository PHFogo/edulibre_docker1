import type { LoginResponse, User } from '../types';
import api from './api';

export async function loginRequest(email: string, password: string) {
  const response = await api.post<LoginResponse>('/login', { email, password });
  return response.data;
}

export async function fetchMe() {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function becomeProfessor() {
  await api.post('/usuarios/me/tornar-professor');
}

export async function requestPasswordReset(email: string) {
  const response = await api.post<{ message: string }>(
    '/auth/password-reset/request',
    { email },
  );
  return response.data;
}

export async function confirmPasswordReset(payload: {
  email: string;
  code: string;
  password: string;
}) {
  const response = await api.post<{ message: string }>(
    '/auth/password-reset/confirm',
    payload,
  );
  return response.data;
}
