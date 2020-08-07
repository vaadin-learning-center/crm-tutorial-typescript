import { css, customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-login/vaadin-login-overlay';
import {LoginI18n} from "@vaadin/vaadin-login/@types/interfaces";
import {Router} from "@vaadin/router";
import {LoginResult, login} from "@vaadin/flow-frontend/Connect"


@customElement('login-view')
export class LoginView extends LitElement{

  @property({type: Boolean})
  private error = false;

  @property({type: Boolean})
  private open = true;

  @property()
  private errorTitle = '';

  @property()
  private errorMessage = '';

  private returnUrl = '/';

  private onSuccess: (result:LoginResult) => void;

  static styles = css`
    :host {
      display: flex;
      
    }
  `;

  constructor(onSuccess?:(result:LoginResult)=>void){
    super();
    const defaultonSuccess = () => {
      Router.go(this.returnUrl);
    };
    this.onSuccess = onSuccess || defaultonSuccess;
  }
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
      this.onSuccess(result);
    }
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
