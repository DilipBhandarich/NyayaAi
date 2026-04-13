import client from './client.js';

export const getLogs = (params) => client.get('/audit', { params });
export const getCaseLogs = (caseId, params) => client.get(`/audit/case/${caseId}`, { params });
