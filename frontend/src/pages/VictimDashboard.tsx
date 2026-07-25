import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
 
export default function VictimDashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
 
  function handleLogout() {
    logoutUser();
    navigate('/login');
  }
 
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name}</h1>
        <button onClick={handleLogout} className="text-sm text-red-600">Log out</button>
      </div>
      <p className="text-slate-500">Victim dashboard — panic button and alert status coming in Week 8.</p>
    </div>
  );
}
