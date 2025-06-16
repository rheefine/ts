import { createElement } from '../utils/dom';
import { navigateTo } from '../main';
import { redirectToGoogleAuth } from '../services/auth/google.api';

export function renderLoginHTML(): string {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-16 w-full max-w-md text-center border border-white/20 shadow-2xl">
        <img src="42pong.png" alt="42pong" class="w-60 h-auto mx-auto mb-12">
        <hr class="w-full border-t border-white/20 mb-14">
        <button id="google-login-btn" class="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 flex items-center justify-center gap-2 hover:bg-white/20 hover:border-white/30 transition-all duration-200 shadow-sm font-semibold">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span class="text-white">Google로 로그인</span>
        </button>
      </div>
    </div>
  `;
}

export function renderLogin(): HTMLElement {
  const wrapper = createElement(renderLoginHTML());

  // 클라이언트 사이드에서만 이벤트 리스너 추가
  if (typeof window !== 'undefined') {
    const googleButton = wrapper.querySelector('#google-login-btn')!;
    googleButton.addEventListener('click', () => {
      redirectToGoogleAuth();
      navigateTo('/lobby');
    });
  }

  return wrapper;
}
