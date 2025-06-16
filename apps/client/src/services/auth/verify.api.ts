import { apiClient } from '../api';

export async function getVerify(): Promise<void> {
  await apiClient.get('api/auth/verify');
}
