import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupForm() {
  const { signup, loading, error } = useAuth();
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
    await signup({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-16 bg-white p-6 rounded shadow flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Sign Up</h2>
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
        autoComplete="new-password"
      />
      {(formError || error) && <div className="text-red-500 text-sm">{formError || error}</div>}
      <button type="submit" className="bg-blue-600 text-white rounded p-2" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
} 