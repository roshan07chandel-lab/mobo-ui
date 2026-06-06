import client from './client';

export const repairsApi = {
  list: (params) => client.get('/api/repairs', { params }),
  get: (id) => client.get(`/api/repairs/${id}`),
  create: (data) => client.post('/api/repairs', data),
  update: (id, data) => client.put(`/api/repairs/${id}`, data),
  delete: (id) => client.delete(`/api/repairs/${id}`)
};
