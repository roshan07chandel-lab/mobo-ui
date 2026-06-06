import client from './client';

export const invoicesApi = {
  list: (params) => client.get('/api/invoices', { params }),
  get: (id) => client.get(`/api/invoices/${id}`),
  create: (data) => client.post('/api/invoices', data),
  markPaid: (id, paymentMode) => client.patch(`/api/invoices/${id}/mark-paid`, { paymentMode }),
  delete: (id) => client.delete(`/api/invoices/${id}`)
};
