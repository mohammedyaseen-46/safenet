import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/auth';
import type { UserRole } from '../types';
import { AxiosError } from 'axios';
 
export default function SignupPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('victim');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, phone, password, role);
      navigate('/login');
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
        <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2" placeholder="Full name"
          value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Phone number"
          value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select className="w-full border rounded px-3 py-2" value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="victim">Victim</option>
          <option value="volunteer">Volunteer</option>
          <option value="admin">Admin</option>
        </select>
        <button disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-600">Log in</Link>
        </p>
      </form>
    </div>
  );
}
