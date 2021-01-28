import { login as loginImpl, logout as logoutImpl } from '@vaadin/flow-frontend';
import type { LoginResult } from '@vaadin/flow-frontend';

const LAST_LOGIN_TIMESTAMP = 'lastLoginTimestamp';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const lastLoginTimestamp = localStorage.getItem(LAST_LOGIN_TIMESTAMP);
const hasRecentLoginTimestamp = (lastLoginTimestamp &&
  (new Date().getTime() - new Date(+lastLoginTimestamp).getTime()) < THIRTY_DAYS_MS) || false;

let _isLoggedIn = hasRecentLoginTimestamp;

export async function login(username: string, password: string): Promise<LoginResult> {
  if (_isLoggedIn) {
    return { error: false } as LoginResult;
  } else {
    const result = await loginImpl(username, password);
    if (!result.error) {
      _isLoggedIn = true;
      window.dispatchEvent(new CustomEvent('crm:login'));
      localStorage.setItem(LAST_LOGIN_TIMESTAMP, new Date().getTime() + '')
    }
    return result;
  }
}

export async function logout() {
  _isLoggedIn = false;
  window.dispatchEvent(new CustomEvent('crm:logout'));
  localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
  (window as any).Vaadin.TypeScript.csrfToken = 'logged-out/offline';
  try {
    await logoutImpl();
  } catch {
    // whatever
  }
}

export function isLoggedIn() {
  return _isLoggedIn;
}

export function setSessionExpired() {
  _isLoggedIn = false;
  localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
}
