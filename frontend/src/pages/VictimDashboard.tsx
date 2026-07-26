import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../api/socket';
import { raiseAlert, cancelAlert } from '../api/alerts';
import type { Alert } from '../api/alerts';
 
type AlertStatus = 'idle' | 'searching' | 'active' | 'resolved' | 'cancelled' | 'error';
 
export default function VictimDashboard() {
  const { user, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<AlertStatus>('idle');
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
 
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
 
    socket.on('alert:updated', (updated: Alert) => {
      setCurrentAlert((prev) => {
        if (!prev || prev.id !== updated.id) return prev;
        setStatus(updated.status);
        return updated;
      });
    });
 
    return () => {
      socket.off('alert:updated');
    };
  }, [token]);
 
  const handlePanic = useCallback(() => {
    setErrorMsg('');
    setStatus('searching');
 
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported on this device.');
      setStatus('error');
      return;
    }
 
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const data = await raiseAlert(lat, lng);
          setCurrentAlert(data.alert);
          setMatchedCount(data.matched_volunteers);
          setStatus('active');
        } catch {
          setErrorMsg('Failed to create alert. Please try again.');
          setStatus('error');
        }
      },
      () => {
        setErrorMsg('Could not get your location. Please enable location access.');
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);
 
  async function handleCancel() {
    if (!currentAlert) return;
    try {
      await cancelAlert(currentAlert.id);
      setStatus('cancelled');
    } catch {
      setErrorMsg('Failed to cancel alert.');
    }
  }
 
  function handleLogout() {
    disconnectSocket();
    logoutUser();
    navigate('/login');
  }
 
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">Hi, {user?.name}</h1>
        <button onClick={handleLogout} className="text-sm text-red-600">Log out</button>
      </div>
 
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {status === 'idle' && (
          <>
            <p className="text-slate-500 mb-8">Tap the button below if you need help.</p>
            <button
              onClick={handlePanic}
              className="w-48 h-48 rounded-full bg-red-600 text-white text-2xl font-bold shadow-lg active:scale-95 transition"
            >
              SOS
            </button>
          </>
        )}
 
        {status === 'searching' && (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-700 font-medium">Getting your location and raising alert...</p>
          </div>
        )}
 
        {status === 'active' && (
          <div className="space-y-4 max-w-sm">
            <p className="text-xl font-bold text-slate-800">Alert sent!</p>
            <p className="text-slate-500">
              {matchedCount !== null && matchedCount > 0
                ? `${matchedCount} nearby volunteer(s) notified.`
                : 'Searching for nearby volunteers...'}
            </p>
            <button onClick={handleCancel} className="mt-4 text-sm text-slate-500 underline">
              Cancel this alert
            </button>
          </div>
        )}
 
        {status === 'resolved' && (
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-800">Marked as resolved.</p>
            <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-blue-600 underline">
              Back to home
            </button>
          </div>
        )}
 
        {status === 'cancelled' && (
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-800">Alert cancelled.</p>
            <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-blue-600 underline">
              Back to home
            </button>
          </div>
        )}
 
        {status === 'error' && (
          <div className="space-y-2">
            <p className="text-red-600">{errorMsg}</p>
            <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-blue-600 underline">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
