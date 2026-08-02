import apiClient from './client';
 
export interface Alert {
  id: string;
  victim_id: string;
  status: 'active' | 'resolved' | 'cancelled';
  origin_lat: number;
  origin_lng: number;
  created_at: string;
  resolved_at: string | null;
  matched_volunteers?: { user_id: string; name: string; distance_km: number }[];


}
 
export async function raiseAlert(lat: number, lng: number) {
  const response = await apiClient.post<{
    message: string; alert: Alert; matched_volunteers: number;
  }>('/alerts', { lat, lng });
  return response.data;
}
 
export async function cancelAlert(alertId: string) {
  const response = await apiClient.patch<{ message: string; alert: Alert }>(
    `/alerts/${alertId}/cancel`
  );
  return response.data;
}
