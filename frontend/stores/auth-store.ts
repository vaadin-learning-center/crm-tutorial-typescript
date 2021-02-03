import { makeAutoObservable, runInAction } from 'mobx';
import type { LoginResult } from '@vaadin/flow-frontend';
import { login as loginImpl, logout as logoutImpl } from '@vaadin/flow-frontend';

const LAST_LOGIN_TIMESTAMP = 'lastLoginTimestamp';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const lastLoginTimestamp = localStorage.getItem(LAST_LOGIN_TIMESTAMP);
const hasRecentLoginTimestamp = (lastLoginTimestamp &&
  (new Date().getTime() - new Date(+lastLoginTimestamp).getTime()) < THIRTY_DAYS_MS) || false;

export class AuthStore {
  isLoggedIn = hasRecentLoginTimestamp;

  constructor() {
    makeAutoObservable(this);
  }

  async login(username: string, password: string): Promise<LoginResult> {
    if (this.isLoggedIn) {
      return {error: false} as LoginResult;
    } else {
      const result = await loginImpl(username, password);
      if (!result.error) {
        runInAction(() => this.isLoggedIn = true);
        localStorage.setItem(LAST_LOGIN_TIMESTAMP, new Date().getTime() + '')
      }
      return result;
    }
  }

  async logout() {
    this.isLoggedIn = false;
    localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
    return await logoutImpl();
  }

  setSessionExpired() {
    this.isLoggedIn = false;
    localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
  }
}
