import apiClient from './client';
import type { Alert } from './alerts';
 
export interface PendingVolunteer {
  user_id: string;
  name: string;
  phone: string;
  id_document_url: string;
  verification_status: string;
}
 
export async function getPendingVolunteers() {
  const response = await apiClient.get<{ pending: PendingVolunteer[] }>('/admin/volunteers/pending');
  return response.data.pending;
}
 
export async function reviewVolunteer(userId: string, status: 'approved' | 'rejected') {
  const response = await apiClient.patch(`/admin/volunteers/${userId}`, { status });
  return response.data;
}
 
export async function getActiveAlerts() {
  const response = await apiClient.get<{ alerts: Alert[] }>('/admin/alerts/active');
  return response.data.alerts;
}
 
export async function resolveAlert(alertId: string) {
  const response = await apiClient.patch(`/admin/alerts/${alertId}/resolve`);
  return response.data;
}
export interface VolunteerSummary {
  user_id: string;
  name: string;
  phone: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  last_seen: string | null;
}
 
export async function getAllVolunteers() {
  const response = await apiClient.get<{ volunteers: VolunteerSummary[] }>('/admin/volunteers');
  return response.data.volunteers;
}


