import client from './client.js';

export const generate = (caseId) => client.post(`/cases/${caseId}/bail-assessment`);
export const list = (caseId) => client.get(`/cases/${caseId}/bail-assessments`);
