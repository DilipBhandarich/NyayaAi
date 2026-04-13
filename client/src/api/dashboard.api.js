import apiClient from './client.js';

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
};
