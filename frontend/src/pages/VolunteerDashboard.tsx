import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../api/socket';
import { submitVolunteerProfile, toggleActive } from '../api/volunteer';
import type { Alert } from '../api/alerts';
 
export default function VolunteerDashboard() {
  const { user, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<Alert | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [profileStatus, setProfileStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const locationInterval = useRef<number | null>(null);
 
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
 
    socket.on('alert:new', (alert: Alert) => {
      setIncomingAlert(alert);
    });
 
    socket.on('alert:updated', (updated: Alert) => {
      setIncomingAlert((prev) => (prev && prev.id === updated.id ? null : prev));
    });
 
    return () => {
      socket.off('alert:new');
      socket.off('alert:updated');
    };
  }, [token]);
 
  useEffect(() => {
    function sendLocation() {
      if (!navigator.geolocation || !token) return;
      navigator.geolocation.getCurrentPosition((position) => {
        const socket = connectSocket(token);
        socket.emit('location:update', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
 
    if (isActive) {
      sendLocation();
      locationInterval.current = window.setInterval(sendLocation, 45000);
    } else if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
 
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, [isActive, token]);
 
  async function handleToggle() {
    try {
      const next = !isActive;
      await toggleActive(next);
      setIsActive(next);
      setErrorMsg('');
    } catch {
      setErrorMsg('Cannot go active — your profile may not be approved yet.');
    }
  }
 
  async function handleUpload() {
    if (!uploadFile) return;
    try {
      await submitVolunteerProfile(uploadFile);
      setProfileStatus('Submitted! Waiting for admin approval.');
    } catch {
      setProfileStatus('Upload failed. Please try again.');
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
 
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-2">ID Verification</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            className="text-sm mb-2"
          />
          <button
            onClick={handleUpload}
            disabled={!uploadFile}
            className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
          >
            Submit ID Document
          </button>
          {profileStatus && <p className="text-sm text-slate-500 mt-2">{profileStatus}</p>}
        </div>
 
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Available for Alerts</h2>
            <p className="text-sm text-slate-500">Turn on once your profile is approved.</p>
          </div>
          <button
            onClick={handleToggle}
            className={`w-14 h-8 rounded-full transition ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow transform transition ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
 
        {incomingAlert && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 space-y-2">
            <p className="font-bold text-red-700">Emergency Alert Nearby</p>
            <p className="text-sm text-slate-600">
              Location: {incomingAlert.origin_lat.toFixed(4)}, {incomingAlert.origin_lng.toFixed(4)}
            </p>
            <a
              href={`https://www.google.com/maps?q=${incomingAlert.origin_lat},${incomingAlert.origin_lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-red-600 text-white text-sm rounded px-4 py-2"
            >
              Open in Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
