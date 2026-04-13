import client from './client.js';

export const search = (params) => client.get('/statutes', { params });
export const lookup = (section) => client.get(`/statutes/lookup/${section}`);
export const categories = () => client.get('/statutes/categories');
