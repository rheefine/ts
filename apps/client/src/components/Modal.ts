import { createElement } from '../utils/dom';

export interface ModalOptions {
  id: string;
  title: string;
  maxWidth?: string;
  onClose?: () => void;
}

export function createModal(options: ModalOptions) {
  const element = createElement(`
    <div class="fixed inset-0 flex items-center justify-center z-50" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 ${options.maxWidth || 'max-w-4xl'} w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">${options.title}</h2>
          <button class="modal-close-btn text-gray-400 hover:text-white text-3xl transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">&times;</button>
        </div>
        <div class="modal-content text-white">
          <!-- 컨텐츠가 여기에 들어갑니다 -->
        </div>
      </div>
    </div>
  `);

  const contentElement = element.querySelector('.modal-content')!;

  const close = () => {
    document.body.style.overflow = '';
    element.remove();
    options.onClose?.();
  };

  // 이벤트 리스너 설정 - X 버튼만으로 닫기
  const closeBtn = element.querySelector('.modal-close-btn');
  closeBtn?.addEventListener('click', close);

  const show = () => {
    document.body.style.overflow = 'hidden';
    document.body.appendChild(element);
  };

  const setContent = (content: string | HTMLElement) => {
    if (typeof content === 'string') {
      contentElement.innerHTML = content;
    } else {
      contentElement.innerHTML = '';
      contentElement.appendChild(content);
    }
  };

  return {
    element,
    contentElement,
    show,
    close,
    setContent,
  };
}
