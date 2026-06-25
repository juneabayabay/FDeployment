import httpClient from './httpClient';

export const notificationsService = {
  list: () => httpClient.get('/notifications/'),

  markRead: (id) => httpClient.post(`/notifications/${id}/read/`),

  markAllRead: () => httpClient.post('/notifications/read-all/'),
};
