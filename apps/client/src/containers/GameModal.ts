import { createModal } from '../components/Modal';
import { PongGame } from '../game/pong';
import { createTournamentInfoModal } from './TournamentInfoModal';
import { patchGame } from '../services/tournaments/game.api';

import type { GameResponseDTO } from '@hst/dto';

export function createGameModal(
  tournamentId: number,
  targetScore: number,
  gameInfo: GameResponseDTO,
) {
  let pongGame: PongGame | null = null;

  const cleanup = () => {
    if (pongGame) {
      pongGame.dispose();
      pongGame = null;
    }
  };

  const modal = createModal({
    id: 'game-modal',
    title: `핑퐁 게임 (라운드 ${gameInfo.round})`,
    maxWidth: 'max-w-4xl',
    onClose: cleanup,
  });

  const content = `
    <div id="game-description" class="text-white mb-4">
      <p class="mb-2"><strong>조작법:</strong></p>
      <p>Player 1 (왼쪽): W/S 키로 상하 이동</p>
      <p>Player 2 (오른쪽): ↑/↓ 키로 상하 이동</p>
      <p class="mt-2"><strong>목표 점수: ${targetScore}점</strong></p>
    </div>
    
    <div id="game-container" class="bg-black rounded-lg p-4 mb-4">
      <!-- 게임이 여기에 렌더링됩니다 -->
    </div>
    
    <div class="flex space-x-3 justify-center">
      <button id="start-pong-game" class="px-6 py-3 bg-green-600/50 hover:bg-green-600/30 backdrop-blur-lg border border-green-400/30 hover:border-green-400/50 text-white rounded-lg transition-all font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.60a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .60-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
        게임 시작
      </button>
    </div>

    <div class="flex justify-center mt-4">
      <div id="next-game-box" class="w-full bg-blue-600/50 hover:bg-blue-600/30 backdrop-blur-lg border-2 border-blue-400/50 p-2 rounded-lg animate-pulse cursor-pointer transition-all duration-200 hidden">
        <div class="flex items-center justify-between">
          <div class="text-center flex-1">
            <div class="text-blue-200 mt-1">
              다음 단계로 이동
            </div>
          </div>
          <div class="text-white text-xl">
            ▶
          </div>
        </div>
      </div>
    </div>
  `;

  modal.setContent(content);

  // 이벤트 리스너 설정
  const startBtn = modal.contentElement.querySelector('#start-pong-game') as HTMLButtonElement;
  const gameDescription = modal.contentElement.querySelector('#game-description') as HTMLElement;
  const nextGameBox = modal.contentElement.querySelector('#next-game-box') as HTMLElement;
  const gameContainer = modal.contentElement.querySelector('#game-container') as HTMLElement;

  const onGameEnd = async (player1Score: number, player2Score: number) => {
    try {
      // 게임 설명 숨기기
      gameDescription.classList.add('hidden');

      // 게임 결과 서버에 전송
      await patchGame(tournamentId, {
        gameID: gameInfo.gameId,
        player1: gameInfo.player1,
        player2: gameInfo.player2,
        player1Score: player1Score,
        player2Score: player2Score,
      });

      // 다음 게임 박스 표시
      nextGameBox.classList.remove('hidden');
    } catch (error) {
      // 에러가 발생해도 다음 게임 박스는 표시
      nextGameBox.classList.remove('hidden');
    }
  };

  startBtn?.addEventListener('click', () => {
    if (!pongGame) {
      // 전달받은 토너먼트 정보의 타겟 스코어 사용
      pongGame = new PongGame(gameContainer, targetScore, onGameEnd);
    }
    pongGame.startGame();

    // 게임 시작 시 시작 버튼 숨기기
    startBtn.classList.add('hidden');
  });

  nextGameBox?.addEventListener('click', async () => {
    // 게임 모달 닫고 토너먼트 정보 모달 열기
    modal.close();
    const tournamentModal = await createTournamentInfoModal(tournamentId);
    tournamentModal.show();
  });

  return {
    show: modal.show,
    close: modal.close,
  };
}
