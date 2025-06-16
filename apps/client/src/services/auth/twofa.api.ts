import type { Auth2FAVerifyRequestDTO } from '@hst/dto';
import { apiClient } from '../api';

export async function post2FAVerify(verifyData: Auth2FAVerifyRequestDTO): Promise<void> {
  await apiClient.post('api/auth/twofa/verify', verifyData);
}
