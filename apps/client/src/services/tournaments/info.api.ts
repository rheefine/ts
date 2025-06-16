import type {
  TournamentCreateRequestDTO,
  TournamentCreateResponseDTO,
  TournamentInfoResponseDTO,
  TournamentListResponseDTO,
} from '@hst/dto';
import { apiClient } from '../api';

export async function getTournamentList(): Promise<TournamentListResponseDTO> {
  const response = await apiClient.get<TournamentListResponseDTO>('api/tournaments');
  return response.data;
}

export async function postTournament(
  tournamentData: TournamentCreateRequestDTO,
): Promise<TournamentCreateResponseDTO> {
  const response = await apiClient.post<TournamentCreateResponseDTO>(
    'api/tournaments',
    tournamentData,
  );
  return response.data;
}

export async function getTournamentInfo(tournamentId: number): Promise<TournamentInfoResponseDTO> {
  const response = await apiClient.get<TournamentInfoResponseDTO>(
    `api/tournaments/${tournamentId}`,
  );
  return response.data;
}
