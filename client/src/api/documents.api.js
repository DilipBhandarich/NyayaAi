import apiClient from './client.js';

export const documentsApi = {
  upload: (caseId, formData) =>
    apiClient.post(`/cases/${caseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  listByCaseId: (caseId) => apiClient.get(`/cases/${caseId}/documents`),
  getById: (docId) => apiClient.get(`/documents/${docId}`),
};
