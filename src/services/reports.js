import client from './client';

export const reportsApi = {
  summary: (params) => client.get('/api/reports/summary', { params }),
  daily: () => client.get('/api/reports/daily')
};
