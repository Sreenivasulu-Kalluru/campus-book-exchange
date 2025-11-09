// src/services/authService.ts
import api from '../lib/api';
import type { AuthResponse, ApiError } from '../types';

// We need to define the 'inputs' for our forms
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  department?: string;
};

export type { ApiError };

// --- Login Function ---
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

// --- Register Function ---
export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await api.post('/users/register', data);
  return response.data;
};
