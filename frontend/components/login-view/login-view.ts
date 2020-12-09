import { customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-login/vaadin-login-overlay';
import { LoginI18n } from '@vaadin/vaadin-login/@types/interfaces';
import { Router, AfterEnterObserver, RouterLocation } from '@vaadin/router';
import type { LoginResult } from '@vaadin/flow-frontend';
import { login } from '../../auth';
import { Lumo } from '../../utils/lumo';
import styles from './login-view.css';

@customElement('login-view')
export class LoginView extends LitElement implements AfterEnterObserver {

  @property({type: Boolean})
  private error = false;

  @property()
  private errorTitle = '';

  @property()
  private errorMessage = '';

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

  async login(event: CustomEvent): Promise<LoginResult> {
    this.error = false;
    const result = await login(event.detail.username, event.detail.password);
    this.error = result.error;
    this.errorTitle = result.errorTitle || this.errorTitle;
    this.errorMessage = result.errorMessage || this.errorMessage;

    if (!result.error) {
      this.onSuccess(result);
    }

    return result;
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
