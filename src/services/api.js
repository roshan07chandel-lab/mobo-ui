import client from './client';
import { authApi } from './auth';
import { shopsApi } from './shops';
import { customersApi } from './customers';
import { repairsApi } from './repairs';
import { inventoryApi } from './inventory';
import { invoicesApi } from './invoices';
import { reportsApi } from './reports';

const api = {
  auth: authApi,
  shops: shopsApi,
  customers: customersApi,
  repairs: repairsApi,
  inventory: inventoryApi,
  invoices: invoicesApi,
  reports: reportsApi
};

export default api;
export { client };
