import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
 
interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
}
 
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
 
  function loginUser(newUser: User, newToken: string) {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', newToken);
  }
 
  function logoutUser() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
 
  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

 

