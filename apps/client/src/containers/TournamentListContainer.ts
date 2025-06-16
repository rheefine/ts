import { createTournamentList } from '../components/TournamentList';
import { getTournamentList } from '../services/tournaments/info.api';

import type { TournamentListResponseDTO } from '@hst/dto';

export interface TournamentListContainerOptions {
  onTournamentClick: (tournamentId: number) => void;
}

export async function createTournamentListContainer(options: TournamentListContainerOptions) {
  const tournamentList = createTournamentList({
    onTournamentClick: options.onTournamentClick,
  });

  const loadTournaments = async () => {
    try {
      tournamentList.showLoadingState();

      const data: TournamentListResponseDTO = await getTournamentList();

      tournamentList.renderTournaments(data.tournaments);
    } catch (error) {
      tournamentList.showErrorState();
    }
  };

  const refreshTournaments = () => {
    loadTournaments();
  };

  // 초기 로드
  loadTournaments();

  return {
    element: tournamentList.element,
    loadTournaments,
    refreshTournaments,
    showEmptyState: tournamentList.showEmptyState,
    showLoadingState: tournamentList.showLoadingState,
    showErrorState: tournamentList.showErrorState,
  };
}
