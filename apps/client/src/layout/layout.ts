import { createElement } from '../utils/dom';
import { createNavigator } from '../components/navigator';

export function createAppWrapperHTML(): string {
  return `<div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>`;
}

export function createAppWrapper(): HTMLElement {
  return createElement(createAppWrapperHTML());
}

export function createMainLayoutHTML(): string {
  return `
    <div class="flex">
      <div class="flex-1 pr-40" id="page-content">
      </div>
      <div id="navigator-content">
      </div>
    </div>
  `;
}

export async function createMainLayout(pathname: string): Promise<HTMLElement> {
  const { getPageContent } = await import('../router/router');
  const pageContent = await getPageContent(pathname);

  const mainContainer = createElement(createMainLayoutHTML());

  // 페이지 콘텐츠를 직접 DOM으로 추가 (이벤트 리스너 유지)
  const pageContentContainer = mainContainer.querySelector('#page-content');
  const navigatorContainer = mainContainer.querySelector('#navigator-content');

  if (pageContentContainer) {
    pageContentContainer.appendChild(pageContent);
  }

  if (navigatorContainer) {
    // navigator도 DOM 요소로 생성해야 함
    const navigatorElement = await createNavigator();
    navigatorContainer.appendChild(navigatorElement);
  }

  return mainContainer;
}
