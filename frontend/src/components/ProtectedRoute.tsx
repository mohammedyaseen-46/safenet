import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/useAuth';
import type { UserRole } from '../types';
 
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}
 
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuth();
 
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
 
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
 
  return <>{children}</>;
}
