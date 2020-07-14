import {customElement, html, LitElement, property} from 'lit-element';

import '@vaadin/vaadin-login/vaadin-login-overlay';
import {LoginI18n} from "@vaadin/vaadin-login/@types/interfaces";
import {login} from '../auth';

// TODO: avoid code duplication between `login-view` and `login-overlay`
// Ideally the app would use the same component for both purposes.
@customElement('login-overlay')
export class LoginOverlay extends LitElement {

  @property()
  private error = false;

  @property()
  private errorTitle = '';

  @property()
  private errorMessage = '';

  @property()
  private open = true;

  render() {
    return html`
      <vaadin-login-overlay
        ?opened="${this.open}"
        .error=${this.error}
        .i18n="${this.i18n}"
        @login="${this.login}">    
      </vaadin-login-overlay>
    `;
  }

  // use light DOM
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  async login(event: CustomEvent) {
    const result = await login(event.detail.username, event.detail.password);
    this.error = result.error;
    this.errorTitle = result.errorTitle;
    this.errorMessage = result.errorMessage;

    if (!result.error) {
      this.open = false;
      this.dispatchEvent(new CustomEvent('login-success', {
        bubbles: true,
        cancelable: false,
        detail: {...event.detail, token: result.token }
      }));
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
      }
    };
  }
}
