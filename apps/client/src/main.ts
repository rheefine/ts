import './index.css';
import { createAppWrapper, createMainLayout } from './layout/layout';
import { isLoginPage } from './router/router';

async function handleRouteChange() {
  const pathname = window.location.pathname || '/';
  const app = document.getElementById('app');

  if (!app) return;

  try {
    // 기존 앱 래퍼가 있으면 재사용, 없으면 생성
    let appWrapper = app.querySelector('.min-h-screen');
    if (!appWrapper) {
      appWrapper = createAppWrapper();
      app.appendChild(appWrapper);
    }

    // 페이지 콘텐츠 먼저 가져오기
    const { getPageContent } = await import('./router/router');
    const pageContent = await getPageContent(pathname);

    // 실제 렌더링된 후 URL 확인 (인증 실패 시 URL이 '/'로 변경됨)
    const actualPath = window.location.pathname;

    if (isLoginPage(actualPath)) {
      // 로그인 페이지는 네비게이터 없이 렌더링
      appWrapper.innerHTML = '';
      appWrapper.appendChild(pageContent);
    } else {
      // 일반 페이지는 메인 레이아웃과 함께 렌더링
      const mainLayout = await createMainLayout(actualPath);
      appWrapper.innerHTML = '';
      appWrapper.appendChild(mainLayout);
    }
  } catch (error) {
    // 에러 발생 시 로그인 페이지로 리다이렉트
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
      await handleRouteChange();
    }
  }
}

// 앱 초기화
async function initApp() {
  // 초기 라우트 처리
  await handleRouteChange();

  // 히스토리 변경 이벤트 리스너 (뒤로가기/앞으로가기)
  window.addEventListener('popstate', handleRouteChange);
}

// DOM이 로드되면 앱 초기화
document.addEventListener('DOMContentLoaded', initApp);

// 네비게이션 헬퍼 함수 (다른 곳에서 사용할 수 있도록)
export function navigateTo(pathname: string) {
  if (window.location.pathname !== pathname) {
    window.history.pushState(null, '', pathname);
    handleRouteChange();
  }
}
