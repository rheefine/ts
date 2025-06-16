import { createElement } from '../utils/dom';
import type { TournamentItemDTO } from '@hst/dto';

export interface TournamentListOptions {
  onTournamentClick: (tournamentId: number) => void;
}

export function createTournamentList(options: TournamentListOptions) {
  const container = createElement(`
    <div id="tournament-list" class="h-full">
      <div class="text-center text-gray-400 py-8">로딩 중...</div>
    </div>
  `);

  const createTournamentItem = (
    tournament: TournamentItemDTO,
    isFirst: boolean = false,
  ): HTMLElement => {
    const formattedDate = new Date(tournament.createdAt).toLocaleString('ko-KR');

    const borderClasses = isFirst
      ? 'border-t border-b border-gray-700'
      : 'border-b border-gray-700';

    const item = createElement(`
      <div class="p-4 ${borderClasses} hover:border-gray-600 transition-colors cursor-pointer tournament-item" data-id="${tournament.tournamentId}">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h3 class="text-white font-semibold">${formattedDate}</h3>
            <span class="text-sm ${tournament.isFinished ? 'text-green-300' : 'text-yellow-300'}">
              ${tournament.isFinished ? '완료' : '진행중'}
            </span>
          </div>
          <div class="text-gray-400 text-xl">
            ▶
          </div>
        </div>
      </div>
    `);

    // 토너먼트 클릭 이벤트
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      options.onTournamentClick(tournament.tournamentId);
    });

    return item;
  };

  const renderTournaments = (tournaments: TournamentItemDTO[]) => {
    container.innerHTML = '';

    if (tournaments.length === 0) {
      showEmptyState();
      return;
    }

    tournaments.forEach((tournament, index) => {
      const item = createTournamentItem(tournament, index === 0);
      container.appendChild(item);
    });
  };

  const showEmptyState = () => {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-full py-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-gray-400 mb-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-300 mb-2 text-center">아직 토너먼트가 없습니다</h3>
        <p class="text-gray-500 text-center">새로운 토너먼트를 만들어보세요!</p>
      </div>
    `;
  };

  const showLoadingState = () => {
    container.innerHTML = '<div class="text-center text-gray-400 py-8">로딩 중...</div>';
  };

  const showErrorState = (message: string = '토너먼트 목록을 불러올 수 없습니다.') => {
    container.innerHTML = `<div class="text-center text-red-400 py-8">${message}</div>`;
  };

  return {
    element: container,
    renderTournaments,
    showEmptyState,
    showLoadingState,
    showErrorState,
  };
}
