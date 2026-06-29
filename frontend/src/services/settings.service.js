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

  getProcedurePackages: () => httpClient.get('/settings/packages/'),

  createProcedurePackage: (data) => httpClient.post('/settings/packages/', data),

  updateProcedurePackage: (id, data) => httpClient.patch(`/settings/packages/${id}/`, data),

  deleteProcedurePackage: (id) => httpClient.delete(`/settings/packages/${id}/`),
};
