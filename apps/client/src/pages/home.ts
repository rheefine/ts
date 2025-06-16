import { createElement } from '../utils/dom';
import { createTournamentInfoModal } from '../containers/TournamentInfoModal';
import { createTournamentCreateModal } from '../containers/TournamentCreateModal';
import { createTournamentListContainer } from '../containers/TournamentListContainer';

export function renderHomeHTML(): string {
  return `
    <div class="h-screen">
      <!-- 메인 콘텐츠 (네비게이터 너비만큼 왼쪽 마진) -->
      <div class="mx-42 flex flex-col p-8 text-white h-full">
        <div class="flex items-center gap-3 my-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <h1 class="text-3xl font-bold">Lobby</h1>
        </div>
        
        <!-- 스크롤 가능한 토너먼트 리스트 영역 (스크롤바 숨김) -->
        <div class="flex-1 overflow-y-auto mt-4 pb-20 scrollbar-hide" id="tournament-list-container">
          <!-- 토너먼트 리스트가 여기에 들어갑니다 -->
        </div>
        
        <!-- 게임 생성 버튼 -->
        <div class="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40" style="margin-left: -72px;">
          <button id="start-game-btn" class="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 hover:border-white/30 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl transition-all duration-200 hover:scale-105 min-w-[200px] flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .60-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
            토너먼트 생성
          </button>
        </div>
      </div>
      
      <!-- 스크롤바 숨김을 위한 스타일 -->
      <style>
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      </style>
    </div>
  `;
}

export async function renderHome(): Promise<HTMLElement> {
  const container = createElement(renderHomeHTML());
  const listContainer = container.querySelector('#tournament-list-container')!;

  // 토너먼트 정보 모달 표시
  const showTournamentModal = async (tournamentId: number) => {
    const modal = await createTournamentInfoModal(tournamentId);
    modal.show();
  };

  // 토너먼트 리스트 컨테이너 생성 - await 추가
  const tournamentListContainer = await createTournamentListContainer({
    onTournamentClick: showTournamentModal,
  });

  // 토너먼트 생성 모달 표시
  const showTournamentCreateModal = () => {
    const modal = createTournamentCreateModal(() => {
      tournamentListContainer.refreshTournaments();
    });
    modal.show();
  };

  // 토너먼트 리스트를 컨테이너에 추가
  listContainer.appendChild(tournamentListContainer.element);

  // 게임 시작 버튼 이벤트 리스너
  const startGameBtn = container.querySelector('#start-game-btn');
  startGameBtn?.addEventListener('click', showTournamentCreateModal);

  return container;
}
