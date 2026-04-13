import apiClient from './client.js';

export const predictionsApi = {
  listByCaseId: (caseId) => apiClient.get(`/cases/${caseId}/predictions`),
};
