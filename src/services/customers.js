import client from './client';

export const customersApi = {
  list: (search = '') => client.get('/api/customers', { params: { search } }),
  get: (id) => client.get(`/api/customers/${id}`),
  create: (data) => client.post('/api/customers', data),
  update: (id, data) => client.put(`/api/customers/${id}`, data),
  delete: (id) => client.delete(`/api/customers/${id}`)
};
