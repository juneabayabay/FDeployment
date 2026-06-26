import httpClient from './httpClient';
import { unwrapList } from '../utils/formatters';

export const dentistsService = {
  listDirectory: async (params) => {
    const { data } = await httpClient.get('/users/dentists/', { params });
    return { ...data, results: unwrapList(data) };
  },

  getDirectory: (id) => httpClient.get(`/users/dentists/${id}/`),

  listProfiles: async (params) => {
    const { data } = await httpClient.get('/users/dentist-profiles/', { params });
    return { ...data, results: unwrapList(data) };
  },

  createProfile: (data) => httpClient.post('/users/dentist-profiles/', data),

  updateProfile: (id, data) => httpClient.patch(`/users/dentist-profiles/${id}/`, data),

  getMyProfile: () => httpClient.get('/users/me/dentist-profile/'),

  updateMyProfile: (data) => httpClient.patch('/users/me/dentist-profile/', data),
};
