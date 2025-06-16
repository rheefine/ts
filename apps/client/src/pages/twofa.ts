import { createElement } from '../utils/dom';
import { post2FAVerify } from '../services/auth/twofa.api';
import { navigateTo } from '../main';

export function renderTwoFAHTML(): string {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">2단계 인증</h1>
          <p class="text-gray-300 text-sm">인증 앱에서 생성된 6자리 코드를 입력하세요</p>
        </div>

        <form id="twofa-form" class="space-y-6">
          <div class="space-y-2">
            <label for="token" class="block text-sm font-medium text-gray-300">
              인증 코드
            </label>
            <input
              type="text"
              id="token"
              name="token"
              maxlength="6"
              pattern="[0-9]{6}"
              placeholder="000000"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
              required
              autocomplete="one-time-code"
            />
          </div>

          <div id="error-message" class="hidden text-red-400 text-sm text-center"></div>

          <button
            type="submit"
            id="verify-btn"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>인증하기</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <button id="back-to-login" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderTwoFA(): HTMLElement {
  const container = createElement(renderTwoFAHTML());

  const form = container.querySelector('#twofa-form') as HTMLFormElement;
  const tokenInput = container.querySelector('#token') as HTMLInputElement;
  const verifyBtn = container.querySelector('#verify-btn') as HTMLButtonElement;
  const errorMessage = container.querySelector('#error-message') as HTMLElement;
  const backToLoginBtn = container.querySelector('#back-to-login') as HTMLButtonElement;

  // 숫자만 입력 허용
  tokenInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/[^0-9]/g, '');

    // 6자리가 되면 자동으로 포커스 해제 (선택사항)
    if (target.value.length === 6) {
      target.blur();
    }
  });

  // 에러 메시지 표시
  const showError = (message: string) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  };

  // 에러 메시지 숨김
  const hideError = () => {
    errorMessage.classList.add('hidden');
  };

  // 로딩 상태 설정
  const setLoading = (loading: boolean) => {
    verifyBtn.disabled = loading;
    if (loading) {
      verifyBtn.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>인증 중...</span>
      `;
    } else {
      verifyBtn.innerHTML = '<span>인증하기</span>';
    }
  };

  // 폼 제출 처리
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = tokenInput.value.trim();

    if (token.length !== 6) {
      showError('6자리 코드를 입력해주세요.');
      return;
    }

    hideError();
    setLoading(true);

    try {
      await post2FAVerify({ token });

      // 인증 성공 시 로비로 이동 (히스토리 API 사용)
      navigateTo('/lobby');
    } catch (error) {
      showError('인증 코드가 올바르지 않습니다. 다시 시도해주세요.');
      tokenInput.select(); // 입력된 코드 선택
    } finally {
      setLoading(false);
    }
  });

  // 로그인으로 돌아가기 (히스토리 API 사용)
  backToLoginBtn.addEventListener('click', () => {
    navigateTo('/');
  });

  // 페이지 로드 시 입력 필드에 포커스
  setTimeout(() => {
    tokenInput.focus();
  }, 100);

  return container;
}
