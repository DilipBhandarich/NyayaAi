import apiClient from './client.js';

export const evidenceApi = {
  listByCaseId: (caseId) => apiClient.get(`/cases/${caseId}/evidence`),
  create: (caseId, data) => apiClient.post(`/cases/${caseId}/evidence`, data),
};
