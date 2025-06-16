import { apiClient } from '../api';

export async function postLogout(): Promise<void> {
  await apiClient.post('api/auth/logout');
}
