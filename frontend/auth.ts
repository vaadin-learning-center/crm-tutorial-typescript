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
      localStorage.setItem(LAST_LOGIN_TIMESTAMP, new Date().getTime() + '')
    }
    return result;
  }
}

export async function logout() {
  _isLoggedIn = false;
  localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
  return await logoutImpl();
}

export function isLoggedIn() {
  return _isLoggedIn;
}

export function setSessionExpired() {
  _isLoggedIn = false;
  localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
}