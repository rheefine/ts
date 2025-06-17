import type {
  UserSettingResponseDTO,
  UserSettingUpdateRequestDTO,
  UserSettingUpdateResponseDTO
} from '@hst/dto';
import { apiClient } from '../api';

export async function getUserSettings(): Promise<UserSettingResponseDTO> {
  const response = await apiClient.get<UserSettingResponseDTO>('api/user/setting');
  return response.data;
}

export async function patchUserSettings(
  settingData: UserSettingUpdateRequestDTO,
): Promise<UserSettingUpdateResponseDTO> {
  const response = await apiClient.post<UserSettingUpdateResponseDTO>(
    'api/user/setting/twofa',
    settingData,
  );
  return response.data;
}
