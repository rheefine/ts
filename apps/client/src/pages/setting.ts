import { createElement } from '../utils/dom';
import { getUserSettings, patchUserSettings } from '../services/user/setting.api';
import { createModal } from '../components/Modal';

export function renderSettingHTML(): string {
  return `
    <div class="h-screen">
      <!-- setting 콘텐츠 (네비게이터 너비만큼 왼쪽 마진) -->
      <div class="mx-42 flex flex-col p-8 text-white h-full">
        <div class="flex items-center gap-3 my-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <h1 class="text-3xl font-bold">Setting</h1>
        </div>
        
        <!-- 2FA 설정 -->
        <div class="mt-4 p-6 border-t border-b border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
              <p class="text-gray-400">보안을 위해 2단계 인증을 설정하세요</p>
            </div>
            <div class="flex items-center">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="twofa-toggle" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSetting(): HTMLElement {
  const element = createElement(renderSettingHTML());

  const twoFAToggle = element.querySelector('#twofa-toggle') as HTMLInputElement;
  let qrModal: ReturnType<typeof createModal> | null = null;

  // 초기 설정 로드
  async function loadUserSettings() {
    try {
      const settings = await getUserSettings();
      twoFAToggle.checked = settings.twoFA;
    } catch (error) {}
  }

  // 2FA 설정 변경
  async function handleTwoFAToggle() {
    try {
      const newTwoFAState = twoFAToggle.checked;

      const setupData = await patchUserSettings({ twoFA: newTwoFAState });
      if (setupData.twofa === true) showQRModal(setupData.qrLink);
    } catch (error) {
      // 실패 시 토글 상태 되돌리기
      twoFAToggle.checked = !twoFAToggle.checked;
    }
  }

  // QR 모달 표시
  function showQRModal(qrLink: string) {
    qrModal = createModal({
      id: 'qr-modal',
      title: '2FA 설정',
      maxWidth: 'max-w-md',
    });

    const modalContent = `
      <div class="text-center">
        <p class="text-gray-300 mb-4">구글 인증 앱으로 아래 QR 코드를 스캔하세요</p>
        <div class="flex justify-center mb-4">
          <img src="${qrLink}" alt="QR Code" class="w-48 h-48 mx-auto">
        </div>
        <button id="confirm-qr" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          설정 완료
        </button>
      </div>
    `;

    qrModal.setContent(modalContent);
    qrModal.show();

    // 설정 완료 버튼 이벤트
    const confirmBtn = qrModal.element.querySelector('#confirm-qr');
    confirmBtn?.addEventListener('click', () => {
      qrModal?.close();
    });
  }

  // 이벤트 리스너
  twoFAToggle.addEventListener('change', handleTwoFAToggle);

  // 초기 설정 로드
  loadUserSettings();

  return element;
}
