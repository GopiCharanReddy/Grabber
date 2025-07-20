import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/signin" replace />;
  return <>{children}</>;
} 