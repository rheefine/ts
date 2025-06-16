import { createElement } from '../utils/dom';
import { navigateTo } from '../main';

export function createNavigatorHTML(): string {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';

  return `
    <nav class="fixed right-0 top-0 h-full w-40 bg-white/10 backdrop-blur-lg border-l border-white/20 text-white p-4 shadow-2xl flex flex-col">
      <div class="mt-2 mb-6 text-center">
        <img src="42pong.png" alt="42pong" class="w-28 h-auto mx-auto">
      </div>
      <ul class="space-y-4">
        <li>
          <button id="nav-lobby" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-white/20 transition-colors ${currentPath === '/lobby' ? 'bg-white/20' : ''} font-medium w-full text-left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Lobby
          </button>
        </li>
        <li>
          <button id="nav-setting" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-white/20 transition-colors ${currentPath === '/setting' ? 'bg-white/20' : ''} font-medium w-full text-left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Setting
          </button>  
        </li>
      </ul>
      
      <!-- 로그아웃 버튼 -->
      <div class="mt-auto mb-4">
        <button id="logout-btn" class="flex items-center gap-2 w-full px-4 py-2 rounded hover:bg-red-600/50 transition-colors text-red-500 hover:text-red-300 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  `;
}

export function createNavigator(): HTMLElement {
  const navigator = createElement(createNavigatorHTML());

  // 네비게이션 버튼 이벤트 리스너
  const lobbyBtn = navigator.querySelector('#nav-lobby');
  const settingBtn = navigator.querySelector('#nav-setting');
  const logoutBtn = navigator.querySelector('#logout-btn');

  lobbyBtn?.addEventListener('click', () => navigateTo('/lobby'));
  settingBtn?.addEventListener('click', () => navigateTo('/setting'));

  // 로그아웃 버튼 이벤트 리스너
  logoutBtn?.addEventListener('click', () => {
    // 로그아웃 처리 로직 (토큰 삭제 등)
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigateTo('/');
  });

  return navigator;
}
