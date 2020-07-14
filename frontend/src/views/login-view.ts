import { css, customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-login/vaadin-login-form';
import {LoginI18n} from "@vaadin/vaadin-login/@types/interfaces";
import {Router} from "@vaadin/router";
import { login } from '../auth';
import {Lumo} from "../../styles/lumo";

@customElement('login-view')
export class LoginView extends LitElement {

  @property()
  private error = false;

  @property()
  private errorTitle = '';

  @property()
  private errorMessage = '';

  private returnUrl = '/';

  static styles = [
    Lumo,
    css`:host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
    }`
  ];

  render() {
    return html`
      <h1>Vaadin CRM</h1>
      <vaadin-login-form
        .error=${this.error}
        .i18n="${this.i18n}"
        @login="${this.login}">    
      </vaadin-login-form>
      <p>Log in with user: <b>user</b> and password: <b>password</b>.</p>
    `;
  }

  // TODO: import the AfterEnterObserver interface from @vaadin/router
  onAfterEnter(context: Router.Context) {
    // TODO: add the `returnUrl` property to the `Router.Context` type
    this.returnUrl = (context as any).redirectFrom || this.returnUrl;
  }

  async login(event: CustomEvent) {
    const result = await login(event.detail.username, event.detail.password);
    this.error = result.error;
    this.errorTitle = result.errorTitle;
    this.errorMessage = result.errorMessage;

    if (!result.error) {
      Router.go(this.returnUrl);
    }
  }

  private get i18n(): LoginI18n {
    return {
      header: {
        title: 'Vaadin CRM',
        description: 'Demo app for the Java Web App tutorial series'
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
