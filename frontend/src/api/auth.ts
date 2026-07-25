import apiClient from './client';
import type { AuthResponse, UserRole } from '../types';
 
export async function signup(
  name: string,
  phone: string,
  password: string,
  role: UserRole
) {
  const response = await apiClient.post('/auth/signup', { name, phone, password, role });
  return response.data;
}
 
export async function login(phone: string, password: string) {
  const response = await apiClient.post<AuthResponse>('/auth/login', { phone, password });
  return response.data;
}
