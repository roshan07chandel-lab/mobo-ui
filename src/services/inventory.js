import client from './client';

export const inventoryApi = {
  list: (params) => client.get('/api/inventory', { params }),
  get: (id) => client.get(`/api/inventory/${id}`),
  create: (data) => client.post('/api/inventory', data),
  update: (id, data) => client.put(`/api/inventory/${id}`, data),
  adjustStock: (id, quantity, type) => client.patch(`/api/inventory/${id}/adjust-stock`, { quantity, type }),
  delete: (id) => client.delete(`/api/inventory/${id}`)
};
