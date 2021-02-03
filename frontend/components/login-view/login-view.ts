import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers'

import '@vaadin/vaadin-login/vaadin-login-overlay';
import { LoginI18n } from '@vaadin/vaadin-login';
import { Router, AfterEnterObserver, RouterLocation } from '@vaadin/router';
import type { LoginResult } from '@vaadin/flow-frontend';
import { login } from '../../store/auth';
import { Lumo } from '../../utils/lumo';
import styles from './login-view.css';

import type { RootState } from '../../store';
import { store } from '../../store';

@customElement('login-view')
export class LoginView extends connect(store)(LitElement) implements AfterEnterObserver {

  @property({type: Boolean})
  private error = false;

  @property()
  private errorTitle = '';

  @property()
  private errorMessage = '';

  private lastIsLoggedIn = false;

  stateChanged(state: RootState) {
    if (this.lastIsLoggedIn != state.auth.isLoggedIn) {
      this.lastIsLoggedIn = state.auth.isLoggedIn;
      if (state.auth.isLoggedIn) {
        this.onSuccess(state.auth.loginResult!);
      }
    }

    this.error = state.auth.loginResult?.error || false;
    this.errorTitle = state.auth.loginResult?.errorTitle || '';
    this.errorMessage = state.auth.loginResult?.errorMessage || '';
  }

  private returnUrl = '/';

  private onSuccess: (result: LoginResult) => void;

  static styles = [Lumo, styles];

  constructor(){
    super();
    this.onSuccess = () => {
      Router.go(this.returnUrl);
    };
  }

  private static popupResult?: Promise<LoginResult>;
  static async openAsPopup(): Promise<LoginResult> {
    if (this.popupResult) {
      return this.popupResult;
    }

    const popup = new this();
    return this.popupResult = new Promise(resolve => {
      popup.onSuccess = result => {
        this.popupResult = undefined;
        popup.remove();
        resolve(result);
      }
      document.body.append(popup);
    });
  }

  render() {
    return html`
      <vaadin-login-overlay
        opened 
        .error=${this.error}
        .i18n="${this.i18n}"
        @login="${this.login}">    
      </vaadin-login-overlay>
    `;
  }

  onAfterEnter(location: RouterLocation) {
    this.returnUrl = location.redirectFrom || this.returnUrl;
  }

  private login(event: CustomEvent) {
    store.dispatch(login({
      username: event.detail.username,
      password: event.detail.password
    }));
  }

  private get i18n(): LoginI18n {
    return {
      header: {
        title: 'Vaadin CRM',
        description: 'Demo app for the Java Web App tutorial series. Log in with user: user and password: password.'
      },
      form: {
        title: 'Log in',
        username: 'Username',
        password: 'Password',
        submit: 'Log in',
        forgotPassword: 'Forgot password'
      },
      errorMessage: {
        title: this.errorTitle,
        message: this.errorMessage
      },
    };
  }
}
