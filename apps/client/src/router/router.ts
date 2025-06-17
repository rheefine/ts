import { renderHome, renderHomeHTML } from '../pages/home';
import { renderSetting, renderSettingHTML } from '../pages/setting';
import { renderLogin, renderLoginHTML } from '../pages/login';
import { renderTwoFA, renderTwoFAHTML } from '../pages/twofa';
import { getVerify } from '../services/auth/verify.api';

export interface Route {
  path: string;
  component: () => HTMLElement | Promise<HTMLElement>;
  componentHTML: () => string;
  requiresAuth?: boolean;
}

export const routes: Route[] = [
  { path: '/', component: () => { window.location.href = '/lobby'; return document.createElement('div'); }, componentHTML: () => '' }, // 루트 접근 시 lobby로 리다이렉트
  { path: '/login', component: renderLogin, componentHTML: renderLoginHTML },
  { path: '/twofa', component: renderTwoFA, componentHTML: renderTwoFAHTML },
  { path: '/lobby', component: renderHome, componentHTML: renderHomeHTML, requiresAuth: true },
  {
    path: '/setting',
    component: renderSetting,
    componentHTML: renderSettingHTML,
    requiresAuth: true,
  },
];

async function checkAuth(): Promise<boolean> {
  try {
    await getVerify();
    return true;
  } catch (error) {
    return false;
  }
}

export async function getPageContent(pathname: string): Promise<HTMLElement> {
  const route = routes.find((r) => r.path === pathname);

  if (route) {
    // 인증이 필요한 페이지인 경우 토큰 검증
    if (route.requiresAuth) {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        window.history.pushState(null, '', '/login');
        return renderLogin();
      }
    }

    return await route.component();
  }

  // 404 페이지
  const notFoundDiv = document.createElement('div');
  notFoundDiv.className = 'p-4 text-white';
  notFoundDiv.textContent = '404 - Page not found';
  return notFoundDiv;
}

export async function getPageContentHTML(pathname: string): Promise<string> {
  const route = routes.find((r) => r.path === pathname);

  if (route) {
    // 인증이 필요한 페이지인 경우 토큰 검증
    if (route.requiresAuth) {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        window.history.pushState(null, '', '/login');
        return renderLoginHTML();
      }
    }

    return route.componentHTML();
  }

  return `<div class="p-4 text-white">404 - Page not found</div>`;
}

export function isLoginPage(pathname: string): boolean {
  return pathname === '/login' || pathname === '/twofa';
}
