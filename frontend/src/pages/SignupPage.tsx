import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';

export default function SignupPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <SignupForm />;
}