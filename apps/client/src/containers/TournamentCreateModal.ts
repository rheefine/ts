import { createModal } from '../components/Modal';
import { createTournamentInfoModal } from './TournamentInfoModal';
import { postTournament } from '../services/tournaments/info.api';
import type { TournamentCreateRequestDTO } from '@hst/dto';

// 타입 가드 함수들 추가 (파일 상단에)
const isValidPlayerCount = (count: number): count is TournamentCreateRequestDTO['playerCount'] => {
  return count === 2 || count === 4 || count === 8;
};

const isValidTargetScore = (score: number): score is TournamentCreateRequestDTO['targetScore'] => {
  return score === 1 || score === 3 || score === 5;
};

export function createTournamentCreateModal(onTournamentCreated: () => void) {
  let selectedPlayerCount: TournamentCreateRequestDTO['playerCount'] = 2;
  let selectedTargetScore: TournamentCreateRequestDTO['targetScore'] = 1;

  const modal = createModal({
    id: 'tournament-create-modal',
    title: '토너먼트 생성',
    maxWidth: 'max-w-md',
  });

  const showPlayerCountSelection = () => {
    const content = `
      <div id="player-count-selection" class="text-white">
        <h3 class="text-lg font-semibold mb-4">참가자 수를 선택하세요:</h3>
        <div class="space-y-3">
          <button class="player-count-btn w-full bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-lg border border-blue-400/30 hover:border-blue-400/50 text-white py-3 rounded-lg transition-all" data-count="2">
            2명
          </button>
          <button class="player-count-btn w-full bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-lg border border-blue-400/30 hover:border-blue-400/50 text-white py-3 rounded-lg transition-all" data-count="4">
            4명
          </button>
          <button class="player-count-btn w-full bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-lg border border-blue-400/30 hover:border-blue-400/50 text-white py-3 rounded-lg transition-all" data-count="8">
            8명
          </button>
        </div>
      </div>
    `;

    modal.setContent(content);

    // 플레이어 수 선택 이벤트
    const playerCountBtns = modal.contentElement.querySelectorAll('.player-count-btn');
    playerCountBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const count = parseInt((e.target as HTMLElement).dataset.count!);
        if (isValidPlayerCount(count)) {
          selectedPlayerCount = count;
          showTargetScoreSelection();
        }
      });
    });
  };

  const showTargetScoreSelection = () => {
    const content = `
      <div id="target-score-selection" class="text-white">
        <h3 class="text-lg font-semibold mb-4">목표 점수를 선택하세요:</h3>
        <div class="space-y-3">
          <button class="target-score-btn w-full bg-purple-600/20 hover:bg-purple-600/30 backdrop-blur-lg border border-purple-400/30 hover:border-purple-400/50 text-white py-3 rounded-lg transition-all" data-score="1">
            1점
          </button>
          <button class="target-score-btn w-full bg-purple-600/20 hover:bg-purple-600/30 backdrop-blur-lg border border-purple-400/30 hover:border-purple-400/50 text-white py-3 rounded-lg transition-all" data-score="3">
            3점
          </button>
          <button class="target-score-btn w-full bg-purple-600/20 hover:bg-purple-600/30 backdrop-blur-lg border border-purple-400/30 hover:border-purple-400/50 text-white py-3 rounded-lg transition-all" data-score="5">
            5점
          </button>
        </div>
        <div class="mt-4">
          <button id="back-to-player-count" class="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white py-2 rounded-lg transition-all">
            이전
          </button>
        </div>
      </div>
    `;

    modal.setContent(content);

    // 목표 점수 선택 이벤트
    const targetScoreBtns = modal.contentElement.querySelectorAll('.target-score-btn');
    targetScoreBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const score = parseInt((e.target as HTMLElement).dataset.score!);
        if (isValidTargetScore(score)) {
          selectedTargetScore = score;
          showPlayerNameInputs(selectedPlayerCount);
        }
      });
    });

    // 이전 버튼 이벤트
    const backBtn = modal.contentElement.querySelector('#back-to-player-count');
    backBtn?.addEventListener('click', showPlayerCountSelection);
  };

  const showPlayerNameInputs = (count: number) => {
    const nameInputsHTML = Array.from(
      { length: count },
      (_, i) => `
      <div>
        <label class="block text-sm font-medium mb-1">플레이어 ${i + 1}</label>
        <input type="text" class="player-name-input w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="이름을 입력하세요" required>
      </div>
    `,
    ).join('');

    const content = `
      <div class="text-white">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">플레이어 이름을 입력하세요:</h3>
          <div class="text-sm text-gray-400">
            참가자 수: ${selectedPlayerCount}명 | 목표 점수: ${selectedTargetScore}점
          </div>
        </div>
        <div class="space-y-3 mb-6">
          ${nameInputsHTML}
        </div>
        <div class="flex space-x-3">
          <button id="back-to-target-score" class="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white py-3 rounded-lg transition-all">
            이전
          </button>
          <button id="create-tournament-btn" class="flex-1 bg-green-600/50 hover:bg-green-600/30 backdrop-blur-lg border border-green-400/30 hover:border-green-400/50 text-white py-3 rounded-lg transition-all font-semibold">
            토너먼트 생성
          </button>
        </div>
      </div>
    `;

    modal.setContent(content);

    // 이전 버튼 이벤트 (목표 점수 선택으로 돌아가기)
    const backBtn = modal.contentElement.querySelector('#back-to-target-score');
    backBtn?.addEventListener('click', showTargetScoreSelection);

    // 토너먼트 생성 버튼 이벤트
    const createBtn = modal.contentElement.querySelector('#create-tournament-btn');
    createBtn?.addEventListener('click', createTournament);
  };

  const createTournament = async () => {
    const nameInputs = modal.contentElement.querySelectorAll(
      '.player-name-input',
    ) as NodeListOf<HTMLInputElement>;
    const playerNames: string[] = [];

    // 입력값 검증
    for (const input of nameInputs) {
      if (!input.value.trim()) {
        alert('모든 플레이어 이름을 입력해주세요.');
        return;
      }
      playerNames.push(input.value.trim());
    }

    // 중복 이름 검증 추가
    const uniqueNames = new Set(playerNames);
    if (uniqueNames.size !== playerNames.length) {
      alert('플레이어 이름은 중복될 수 없습니다.');
      return;
    }

    try {
      // DTO 타입에 맞는 요청 객체 생성
      const requestData: TournamentCreateRequestDTO = {
        playerCount: selectedPlayerCount,
        playerList: playerNames,
        targetScore: selectedTargetScore,
      };

      const createResponse = await postTournament(requestData);
      modal.close();
      const tournamentInfoModal = await createTournamentInfoModal(createResponse.tournamentId,onTournamentCreated);
      tournamentInfoModal.show();
    } catch (error) {
      console.error('Tournament creation failed:', error);
      alert('토너먼트 생성에 실패했습니다.');
    }
  };

  // 초기 화면 표시
  showPlayerCountSelection();

  return {
    show: modal.show,
    close: modal.close,
  };
}
