import httpClient from './httpClient';

export const patientsService = {
  list: (params) => httpClient.get('/patients/', { params }),

  get: (id) => httpClient.get(`/patients/${id}/`),

  create: (data) => httpClient.post('/patients/', data),

  update: (id, data) => httpClient.patch(`/patients/${id}/`, data),

  delete: (id) => httpClient.delete(`/patients/${id}/`),
};
