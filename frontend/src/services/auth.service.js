import httpClient from './httpClient';

export const authService = {
  login: (email, password) => httpClient.post('/users/token/', { email, password }),

  register: (data) => httpClient.post('/users/register/', data),

  logout: (refresh) => httpClient.post('/users/token/logout/', { refresh }),

  refresh: (refresh) => httpClient.post('/users/token/refresh/', { refresh }),

  getMe: () => httpClient.get('/users/me/'),

  updateMe: (data) => httpClient.patch('/users/me/', data),

  changePassword: (data) => httpClient.post('/users/me/change-password/', data),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return httpClient.post('/users/me/avatar/', formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  deleteAvatar: () => httpClient.delete('/users/me/avatar/'),

  forgotPassword: (email) => httpClient.post('/users/password/forgot/', { email }),

  resetPassword: (data) => httpClient.post('/users/password/reset/', data),
};
