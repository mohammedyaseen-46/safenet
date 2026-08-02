import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../api/socket';
import {
  getPendingVolunteers, reviewVolunteer, getActiveAlerts, resolveAlert,
} from '../api/admin';
import type { PendingVolunteer } from '../api/admin';
import type { Alert } from '../api/alerts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
 import { getAllVolunteers } from '../api/admin';
import type { VolunteerSummary } from '../api/admin';
 

const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;
 

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
 
export default function AdminDashboard() {
  const { user, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'map' | 'pending' | 'alerts' | 'volunteers'>('map');
  const [pending, setPending] = useState<PendingVolunteer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [allVolunteers, setAllVolunteers] = useState<VolunteerSummary[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [p, a, v] = await Promise.all([
          getPendingVolunteers(),
          getActiveAlerts(),
          getAllVolunteers(),
        ]);

        if (!isMounted) return;

        setPending(p);
        setAlerts(a);
        setAllVolunteers(v);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);
  
 
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
 
    socket.on('alert:new', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });
 
    socket.on('alert:updated', (updated: Alert) => {
      setAlerts((prev) => {
        if (updated.status !== 'active') {
          return prev.filter((a) => a.id !== updated.id);
        }
        return prev.map((a) => (a.id === updated.id ? updated : a));
      });
    });
    socket.on('volunteers:online', (ids: string[]) => {
  setOnlineIds(ids);
});
// ...and in the cleanup function:
socket.off('volunteers:online');

 
    return () => {
      socket.off('alert:new');
      socket.off('alert:updated');
    };
  }, [token]);
 
  async function handleReview(userId: string, status: 'approved' | 'rejected') {
    await reviewVolunteer(userId, status);
    setPending((prev) => prev.filter((v) => v.user_id !== userId));
  }
 
  async function handleResolve(alertId: string) {
    await resolveAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }
 
  function handleLogout() {
    disconnectSocket();
    logoutUser();
    navigate('/login');
  }
 
  const defaultCenter: [number, number] = alerts.length > 0
    ? [alerts[0].origin_lat, alerts[0].origin_lng]
    : [12.9716, 77.5946];
 
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">Admin — {user?.name}</h1>
        <button onClick={handleLogout} className="text-sm text-red-600">Log out</button>
      </div>
 
      <div className="flex gap-2 p-4 bg-white border-b">
        <button onClick={() => setTab('map')}
          className={`px-4 py-2 rounded text-sm font-medium ${tab === 'map' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Live Map ({alerts.length})
        </button>
        <button onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded text-sm font-medium ${tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Pending Volunteers ({pending.length})
        </button>
        <button onClick={() => setTab('alerts')}
          className={`px-4 py-2 rounded text-sm font-medium ${tab === 'alerts' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Active Alerts ({alerts.length})
        </button>
        <button onClick={() => setTab('volunteers')}
         className={`px-4 py-2 rounded text-sm font-medium ${tab === 'volunteers' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
         All Volunteers ({allVolunteers.length})
        </button>
      </div>
 
      <div className="flex-1 p-4">
        {loading && <p className="text-slate-500">Loading...</p>}
 
        {!loading && tab === 'map' && (
          <div className="h-[70vh] rounded-lg overflow-hidden shadow-sm">
            <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {alerts.map((alert) => (
                <Marker key={alert.id} position={[alert.origin_lat, alert.origin_lng]}>
                  <Popup>
                    <div className="space-y-1">
                      <p className="font-semibold">Alert {alert.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleString()}</p>
                      <button onClick={() => handleResolve(alert.id)}
                        className="mt-1 bg-green-600 text-white text-xs rounded px-2 py-1">
                        Mark Resolved
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
 
        {!loading && tab === 'pending' && (
          <div className="space-y-3">
            {pending.length === 0 && <p className="text-slate-500">No pending volunteers.</p>}
            {pending.map((v) => (
              <div key={v.user_id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                <img src={`${API_BASE}${v.id_document_url}`} alt="ID document"
                  className="w-20 h-20 object-cover rounded border" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{v.name}</p>
                  <p className="text-sm text-slate-500">{v.phone}</p>
                </div>
                <button onClick={() => handleReview(v.user_id, 'approved')}
                  className="bg-green-600 text-white text-sm rounded px-3 py-1.5">
                  Approve
                </button>
                <button onClick={() => handleReview(v.user_id, 'rejected')}
                  className="bg-red-600 text-white text-sm rounded px-3 py-1.5">
                  Reject
                </button>
              </div>
            ))}
          </div>
        )}
 
        {!loading && tab === 'alerts' && (
  <div className="space-y-3">
    {alerts.length === 0 && <p className="text-slate-500">No active alerts.</p>}
    {alerts.map((alert) => (
      <div key={alert.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">Alert {alert.id.slice(0, 8)}</p>
          <p className="text-sm text-slate-500">
            {alert.origin_lat.toFixed(4)}, {alert.origin_lng.toFixed(4)} — {new Date(alert.created_at).toLocaleString()}
          </p>
          {alert.matched_volunteers && alert.matched_volunteers.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Notified: {alert.matched_volunteers.map((v) => `${v.name} (${v.distance_km}km)`).join(', ')}
            </p>
          )}
        </div>
        <button onClick={() => handleResolve(alert.id)}
          className="bg-green-600 text-white text-sm rounded px-3 py-1.5">
          Mark Resolved
        </button>
      </div>
    ))}
  </div>
)}
  {!loading && tab === 'volunteers' && (
  <div className="space-y-2">
    {allVolunteers.map((v) => (
      <div key={v.user_id} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${onlineIds.includes(v.user_id) ? 'bg-green-500' : 'bg-slate-300'}`} />
        <div className="flex-1">
          <p className="font-medium text-slate-800">{v.name}</p>
          <p className="text-xs text-slate-500">{v.phone}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          v.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
          v.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {v.verification_status}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${v.is_active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
          {v.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
} 
