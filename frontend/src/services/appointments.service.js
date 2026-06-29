import httpClient from './httpClient';

export const appointmentsService = {
  getClinicInfo: () => httpClient.get('/appointments/clinic-info/'),

  getProcedures: () => httpClient.get('/appointments/procedures/'),

  getProcedurePackages: () => httpClient.get('/appointments/procedure-packages/'),

  getSlots: (date, durationMinutes) =>
    httpClient.get('/appointments/slots/', {
      params: { date, duration_minutes: durationMinutes },
    }),

  getCompatibleSlots: (procedureIds, date = null, packageId = null) =>
    httpClient.get('/appointments/slots/compatible/', {
      params: {
        ...(packageId
          ? { package_id: packageId }
          : { procedure_ids: procedureIds.join(',') }),
        ...(date ? { date } : {}),
      },
    }),

  list: (params) => httpClient.get('/appointments/', { params }),

  get: (id) => httpClient.get(`/appointments/${id}/`),

  create: (data) => httpClient.post('/appointments/', data),

  cancel: (id) => httpClient.post(`/appointments/${id}/cancel/`),

  reschedule: (id, data) => httpClient.post(`/appointments/${id}/reschedule/`, data),

  getWaitingList: () => httpClient.get('/appointments/waiting-list/'),

  joinWaitingList: (data) => httpClient.post('/appointments/waiting-list/', data),

  leaveWaitingList: (id) => httpClient.post(`/appointments/waiting-list/${id}/leave/`),
};
