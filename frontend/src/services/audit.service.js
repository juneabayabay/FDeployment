import httpClient from './httpClient';

export const auditService = {
  list: (params) => httpClient.get('/audit-logs/', { params }),
};
