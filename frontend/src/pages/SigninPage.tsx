import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SigninForm from '../components/auth/SigninForm';

export default function SigninPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <SigninForm />;
} 