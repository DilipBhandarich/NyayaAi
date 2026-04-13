import apiClient from './client.js';

export const chatApi = {
  send: (caseId, message) => apiClient.post(`/cases/${caseId}/chat`, { message }),
  getHistory: (caseId, params) => apiClient.get(`/cases/${caseId}/chat`, { params }),
};
