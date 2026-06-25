import httpClient from './httpClient';

export const usersService = {
  list: (params) => httpClient.get('/users/users/', { params }),

  get: (id) => httpClient.get(`/users/users/${id}/`),

  create: (data) => httpClient.post('/users/users/', data),

  update: (id, data) => httpClient.patch(`/users/users/${id}/`, data),

  delete: (id) => httpClient.delete(`/users/users/${id}/`),

  resetPassword: (id) => httpClient.post(`/users/users/${id}/reset-password/`),

  listUserRoles: (params) => httpClient.get('/users/user-roles/', { params }),

  assignRole: (data) => httpClient.post('/users/user-roles/', data),

  removeRole: (id) => httpClient.delete(`/users/user-roles/${id}/`),
};
