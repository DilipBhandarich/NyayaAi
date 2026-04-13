import apiClient from './client.js';

export const casesApi = {
  list: (params) => apiClient.get('/cases', { params }),
  getById: (id) => apiClient.get(`/cases/${id}`),
  create: (data) => apiClient.post('/cases', data),
  update: (id, data) => apiClient.put(`/cases/${id}`, data),
  remove: (id) => apiClient.delete(`/cases/${id}`),
  analyze: (id) => apiClient.post(`/cases/${id}/analyze`),
};
