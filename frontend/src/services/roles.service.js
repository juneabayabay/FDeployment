import httpClient from './httpClient';

export const rolesService = {
  list: (params) => httpClient.get('/users/roles/', { params }),

  get: (id) => httpClient.get(`/users/roles/${id}/`),

  listPermissions: (params) => httpClient.get('/users/permissions/', { params }),

  listRolePermissions: (params) => httpClient.get('/users/role-permissions/', { params }),

  assignPermission: (data) => httpClient.post('/users/role-permissions/', data),

  removePermission: (id) => httpClient.delete(`/users/role-permissions/${id}/`),
};
