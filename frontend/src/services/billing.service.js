import httpClient from './httpClient';

export const billingService = {
  list: () => httpClient.get('/billing/'),
};
