import { createModal } from '../components/Modal';
import { createGameModal } from './GameModal';
import { getTournamentInfo } from '../services/tournaments/info.api';

import type { TournamentInfoResponseDTO, GameResponseDTO } from '@hst/dto';

export async function createTournamentInfoModal(tournamentId: number) {
  const modal = createModal({
    id: 'tournament-modal',
    title: '토너먼트 정보',
    maxWidth: 'max-w-4xl',
  });

  const showGameModal = (targetScore: number, gameInfo: GameResponseDTO) => {
    const gameModal = createGameModal(tournamentId, targetScore, gameInfo);
    modal.close();
    gameModal.show();
  };

  const startNextGame = (tournamentInfo: TournamentInfoResponseDTO) => {
    const nextGame = tournamentInfo.games.find((game: GameResponseDTO) => game.winnerId === null);
    if (nextGame) {
      showGameModal(tournamentInfo.targetScore, nextGame);
    }
  };

  const getWinner = (tournamentInfo: TournamentInfoResponseDTO) => {
    // 모든 게임이 완료되었을 때 우승자 찾기
    if (tournamentInfo.isFinished) {
      const lastRound = Math.min(
        ...tournamentInfo.games.map((game: GameResponseDTO) => game.round),
      );
      const finalGame = tournamentInfo.games.find(
        (game: GameResponseDTO) => game.round === lastRound,
      );
      if (finalGame && finalGame.winnerId) {
        return finalGame.winnerId === 1 ? finalGame.player1 : finalGame.player2;
      }
    }
    return null;
  };

  const loadTournamentInfo = async () => {
    try {
      const tournamentInfo = await getTournamentInfo(tournamentId);
      const nextGame = tournamentInfo.games.find((game: GameResponseDTO) => game.winnerId === null);
      const winner = getWinner(tournamentInfo);

      // 최대 라운드 수 계산
      const maxRound = Math.max(...tournamentInfo.games.map((game: GameResponseDTO) => game.round));

      const bracketHTML = `
        <div class="flex flex-col h-full max-h-[70vh]">
          <!-- 고정 상단 섹션 -->
          <div class="flex-shrink-0 mb-6">
            <h3 class="text-lg font-semibold mb-4">토너먼트 정보</h3>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-lg">
                <span class="text-gray-300">참가자 수:</span>
                <span class="text-white ml-2">${tournamentInfo.playerCount}명</span>
              </div>
              <div class="bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-lg">
                <span class="text-gray-300">목표 점수:</span>
                <span class="text-white ml-2">${tournamentInfo.targetScore}점</span>
              </div>
            </div>
            
            ${
              winner
                ? `
            <div class="bg-gradient-to-r from-yellow-500/50 to-yellow-600/20 backdrop-blur-lg border border-yellow-400/30 p-4 rounded-lg mb-6 text-center">
              <div class="flex items-center justify-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-yellow-300">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                </svg>
                <div class="text-yellow-200 text-xl font-bold">
                  토너먼트 우승자
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-yellow-300">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                </svg>
              </div>
              <div class="text-yellow-100 text-2xl font-bold">
                ${winner}
              </div>
            </div>
            `
                : ''
            }
            
            ${
              nextGame && !tournamentInfo.isFinished
                ? `
            <div class="next-game-btn bg-blue-600/50 hover:bg-blue-600/30 backdrop-blur-lg border-2 border-blue-400/50 p-4 rounded-lg mb-4 animate-pulse cursor-pointer transition-all duration-200">
              <div class="flex items-center justify-between">
                <div class="text-center flex-1">
                  <div class="text-white font-semibold flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.60a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .60-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                    </svg>
                    다음 경기: 라운드 ${maxRound - nextGame.round + 1}
                  </div>
                  <div class="text-blue-200 text-sm mt-1">
                    ${nextGame.player1} vs ${nextGame.player2}
                  </div>
                </div>
                <div class="text-white text-2xl">
                  ▶
                </div>
              </div>
            </div>
            `
                : ''
            }
          </div>
          
          <!-- 스크롤 가능한 경기 결과 섹션 -->
          <div class="flex-1 min-h-0">
            <h3 class="text-lg font-semibold mb-4">경기 결과</h3>
            <div class="h-full overflow-y-auto space-y-3 scrollbar-hide" style="max-height: calc(70vh - 300px);">
              ${tournamentInfo.games
                .slice()
                .reverse()
                .map(
                  (game) => `
                <div class="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-lg ${
                  game.winnerId === null && game === nextGame
                    ? 'border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : ''
                }">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-300">라운드 ${maxRound - game.round + 1}</span>
                    <div class="flex items-center gap-2">
                      ${
                        game.winnerId === null && game === nextGame
                          ? '<span class="text-blue-300 text-sm font-semibold animate-pulse flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.60a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .60-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg> 다음 경기</span>'
                          : ''
                      }
                      <span class="text-sm ${game.winnerId ? 'text-green-300' : 'text-yellow-300'}">
                        ${game.winnerId ? '완료' : '대기중'}
                      </span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex-1">
                      <div class="flex justify-between items-center">
                        <span class="${game.winnerId === 1 ? 'text-green-300 font-bold' : 'text-white'}">${game.player1}</span>
                        <span class="text-gray-300">${game.player1Score ?? '-'}</span>
                      </div>
                      <div class="text-gray-400 text-center my-1">VS</div>
                      <div class="flex justify-between items-center">
                        <span class="${game.winnerId === 2 ? 'text-green-300 font-bold' : 'text-white'}">${game.player2}</span>
                        <span class="text-gray-300">${game.player2Score ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
        
        <!-- 스크롤바 숨김을 위한 스타일 -->
        <style>
          .scrollbar-hide {
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
            scrollbar-width: none;     /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;             /* Safari and Chrome */
          }
        </style>
      `;

      modal.setContent(bracketHTML);

      // 다음 경기 박스 클릭 이벤트 리스너
      if (!tournamentInfo.isFinished && nextGame) {
        const nextGameBtn = modal.contentElement.querySelector('.next-game-btn');
        nextGameBtn?.addEventListener('click', () => {
          startNextGame(tournamentInfo);
        });
      }
    } catch (error) {
      modal.setContent(
        '<div class="text-center text-red-400 py-8">토너먼트 정보를 불러올 수 없습니다.</div>',
      );
    }
  };

  loadTournamentInfo();

  return {
    show: modal.show,
    close: modal.close,
  };
}
