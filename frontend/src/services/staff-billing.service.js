import httpClient from './httpClient';

export const staffBillingService = {
  list: (params) => httpClient.get('/billing/staff/', { params }),

  get: (id) => httpClient.get(`/billing/staff/${id}/`),

  create: (data) => httpClient.post('/billing/staff/', data),

  update: (id, data) => httpClient.patch(`/billing/staff/${id}/`, data),
};
