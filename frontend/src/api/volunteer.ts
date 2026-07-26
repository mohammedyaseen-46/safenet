import apiClient from './client';
 
export async function submitVolunteerProfile(idDocument: File) {
  const formData = new FormData();
  formData.append('id_document', idDocument);
  const response = await apiClient.post('/volunteers/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
 
export async function toggleActive(isActive: boolean) {
  const response = await apiClient.patch('/volunteers/active', { is_active: isActive });
  return response.data;
}
