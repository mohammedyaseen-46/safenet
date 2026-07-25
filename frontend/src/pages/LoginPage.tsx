import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/useAuth';
import { AxiosError } from 'axios';
 
export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
 
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(phone, password);
      loginUser(data.user, data.token);

      if (data.user.role === 'victim') navigate('/victim');
      else if (data.user.role === 'volunteer') navigate('/volunteer');
      else navigate('/admin');
    } catch (err) {
      const message = err instanceof AxiosError
        ? err.response?.data?.error
        : 'Signup failed.';
      setError(message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Log In</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2" placeholder="Phone number"
          value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <p className="text-sm text-slate-500">
          Don't have an account? <Link to="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
