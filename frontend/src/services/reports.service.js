import httpClient from './httpClient';

export const reportsService = {
  getDashboardStats: () => httpClient.get('/reports/dashboard/stats/'),

  getReports: (params) => httpClient.get('/reports/', { params }),
};
