import client from './client';

export const shopsApi = {
  list: () => client.get('/api/shops'),
  get: (id) => client.get(`/api/shops/${id}`),
  create: (data) => client.post('/api/shops', data),
  update: (id, data) => client.put(`/api/shops/${id}`, data),
  delete: (id) => client.delete(`/api/shops/${id}`)
};
