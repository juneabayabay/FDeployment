import httpClient from './httpClient';

export const downPaymentsService = {
  list: (params) => httpClient.get('/billing/staff/down-payments/', { params }),

  create: (data) => httpClient.post('/billing/staff/down-payments/', data),

  approve: (id) => httpClient.post(`/billing/staff/down-payments/${id}/approve/`),

  reject: (id, data) => httpClient.post(`/billing/staff/down-payments/${id}/reject/`, data),
};
