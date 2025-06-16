import type { GameUpdateRequestDTO } from '@hst/dto';
import { apiClient } from '../api';

export async function patchGame(
  tournamentId: number,
  gameData: GameUpdateRequestDTO,
): Promise<void> {
  await apiClient.patch(`api/tournaments/${tournamentId}/games`, gameData);
}
