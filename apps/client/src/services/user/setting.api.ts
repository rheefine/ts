import type {
  UserSettingResponseDTO,
  UserSettingUpdateRequestDTO,
  UserSettingUpdateResponseDTO,
} from '@hst/dto';
import { apiClient } from '../api';

export async function getUserSettings(): Promise<UserSettingResponseDTO> {
  const response = await apiClient.get<UserSettingResponseDTO>('api/users/settings');
  return response.data;
}

export async function patchUserSettings(
  settingData: UserSettingUpdateRequestDTO,
): Promise<UserSettingUpdateResponseDTO> {
  const response = await apiClient.patch<UserSettingUpdateResponseDTO>(
    'api/users/settings',
    settingData,
  );
  return response.data;
}
