import httpClient from './httpClient';

export const settingsService = {
  getClinicSettings: () => httpClient.get('/settings/clinic/'),

  patchClinicSettings: (data) => httpClient.patch('/settings/clinic/', data),

  getEmailSettings: () => httpClient.get('/settings/email/'),

  patchEmailSettings: (data) => httpClient.patch('/settings/email/', data),

  testEmailSettings: (email) => httpClient.post('/settings/email/', email ? { email } : {}),

  getProcedures: () => httpClient.get('/settings/procedures/'),

  createProcedure: (data) => httpClient.post('/settings/procedures/', data),

  updateProcedure: (id, data) => httpClient.patch(`/settings/procedures/${id}/`, data),

  deleteProcedure: (id) => httpClient.delete(`/settings/procedures/${id}/`),
};
