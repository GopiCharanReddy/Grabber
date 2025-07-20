import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { signin as apiSignin, signup as apiSignup, setAuthToken } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  signin: (data: { email: string; password: string }) => Promise<boolean>;
  signup: (data: { email: string; password: string }) => Promise<boolean>;
  signout: () => void;
  loading: boolean;
  error: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedToken && storedEmail) {
      setToken(storedToken);
      setUser({ email: storedEmail });
      setAuthToken(storedToken);
    }
  }, []);

  const signin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(undefined);
    try {
      console.log('Attempting signin with:', data.email); // Debug log
      const response = await apiSignin(data);
      console.log('Signin response:', response); // Debug log
      
      if (response.token) {
        setToken(response.token);
        setUser({ email: data.email });
        setAuthToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('userEmail', data.email);
        setLoading(false);
        return true;
      } else {
        throw new Error(response.message || 'No token received');
      }
    } catch (e: any) {
      console.error('Signin error:', e); // Debug log
      setError(e.response?.data?.message || e.message || 'Sign in failed');
      setLoading(false);
      return false;
    }
  };

  const signup = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(undefined);
    try {
      console.log('Attempting signup with:', data.email); // Debug log
      const response = await apiSignup(data);
      console.log('Signup response:', response); // Debug log
      
      if (response.message === 'User signed up successfully.') {
        // After successful signup, automatically sign in
        return signin(data);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (e: any) {
      console.error('Signup error:', e); // Debug log
      setError(e.response?.data?.message || e.message || 'Sign up failed');
      setLoading(false);
      return false;
    }
  };

  const signout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  };

  return (
    <AuthContext.Provider value={{ user, token, signin, signup, signout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 