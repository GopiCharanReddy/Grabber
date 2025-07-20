import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function SigninForm() {
  const { signin, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    await signin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-16 bg-white p-6 rounded shadow flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Sign In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 rounded"
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 rounded"
        autoComplete="current-password"
      />
      {(formError || error) && <div className="text-red-500 text-sm">{formError || error}</div>}
      <button type="submit" className="bg-blue-600 text-white rounded p-2" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
} 