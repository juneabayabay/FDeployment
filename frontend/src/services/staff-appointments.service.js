import httpClient from './httpClient';

export const staffAppointmentsService = {
  list: (params) => httpClient.get('/appointments/staff/', { params }),

  get: (id) => httpClient.get(`/appointments/staff/${id}/`),

  create: (data) => httpClient.post('/appointments/staff/', data),

  update: (id, data) => httpClient.patch(`/appointments/staff/${id}/`, data),

  cancel: (id) => httpClient.post(`/appointments/staff/${id}/cancel/`),

  reschedule: (id, data) => httpClient.post(`/appointments/staff/${id}/reschedule/`, data),

  getSchedule: (date) =>
    httpClient.get('/appointments/staff/schedule/', { params: { date } }),

  getWaitingList: (params) =>
    httpClient.get('/appointments/waiting-list/staff/', { params }),

  deactivateWaitingList: (id) =>
    httpClient.post(`/appointments/waiting-list/staff/${id}/deactivate/`),

  bookWaitingList: (id, data) =>
    httpClient.post(`/appointments/waiting-list/staff/${id}/book/`, data),

  getNextAvailableSlot: (params) =>
    httpClient.get('/appointments/staff/next-available-slot/', { params }),
};
