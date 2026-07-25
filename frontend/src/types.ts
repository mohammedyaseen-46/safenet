export type UserRole = 'victim' | 'volunteer' | 'admin';
 
export interface User {
  id: string;
  name: string;
  role: UserRole;
}
 
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
