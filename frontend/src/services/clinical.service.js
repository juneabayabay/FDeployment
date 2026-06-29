import httpClient from './httpClient';

export const clinicalService = {
  listTreatments: (patientId) => httpClient.get(`/patients/${patientId}/treatments/`),

  createTreatment: (patientId, data) =>
    httpClient.post(`/patients/${patientId}/treatments/`, data),

  listOrthodontic: (patientId) => httpClient.get(`/patients/${patientId}/orthodontic/`),

  createOrthodontic: (patientId, data) =>
    httpClient.post(`/patients/${patientId}/orthodontic/`, data),

  updateOrthodontic: (patientId, id, data) =>
    httpClient.patch(`/patients/${patientId}/orthodontic/${id}/`, data),

  updateTreatment: (patientId, id, data) =>
    httpClient.patch(`/patients/${patientId}/treatments/${id}/`, data),

  deleteTreatment: (patientId, id) =>
    httpClient.delete(`/patients/${patientId}/treatments/${id}/`),

  listSurgical: (patientId) => httpClient.get(`/patients/${patientId}/surgical/`),

  createSurgical: (patientId, data) =>
    httpClient.post(`/patients/${patientId}/surgical/`, data),

  updateSurgical: (patientId, id, data) =>
    httpClient.patch(`/patients/${patientId}/surgical/${id}/`, data),

  deleteSurgical: (patientId, id) =>
    httpClient.delete(`/patients/${patientId}/surgical/${id}/`),

  deleteOrthodontic: (patientId, id) =>
    httpClient.delete(`/patients/${patientId}/orthodontic/${id}/`),

  listPrescriptions: (patientId) => httpClient.get(`/patients/${patientId}/prescriptions/`),

  createPrescription: (patientId, data) =>
    httpClient.post(`/patients/${patientId}/prescriptions/`, data),

  updatePrescription: (patientId, id, data) =>
    httpClient.patch(`/patients/${patientId}/prescriptions/${id}/`, data),

  scheduleOrthodonticNext: (patientId, id) =>
    httpClient.post(`/patients/${patientId}/orthodontic/${id}/schedule-next/`),
};
