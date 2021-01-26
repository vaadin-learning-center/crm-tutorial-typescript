import { customElement, html, LitElement, unsafeCSS } from 'lit-element';
import { Router, AfterEnterObserver, RouterLocation } from '@vaadin/router';
import type { LoginResult } from '@vaadin/flow-frontend';
import { oktaSignIn, getUserInfo } from '../../auth';

import { Lumo } from '../../utils/lumo';
import styles from './login-view.css';

// TODO: why do I need to force raw-loader here?
import oktaStyles from '!!raw-loader!@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

@customElement('login-view')
export class LoginView extends LitElement implements AfterEnterObserver {

  private returnUrl = '/';

  private onSuccess: (result: LoginResult) => void;

  static styles = [Lumo, unsafeCSS(oktaStyles), styles];

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

  // The Okta Sign-In widget does not handle Shadow DOM
  protected createRenderRoot() {
    return this;
  }

  // TODO: use the vaadin-login component and the Okta JS SDK instead of the Okta Sign-In widget
  // see https://github.com/okta/okta-auth-js
  render() {
    return html`
      <style>${oktaStyles}</style>

      <!-- where the sign-in form will be displayed -->
      <div id="okta-login-container" style="padding-top: 4em;"></div>

      <p style="text-align: center;">user@vaadin.com / Passw0rd!</p>
    `;
  }

  onAfterEnter(location: RouterLocation) {
    this.returnUrl = location.redirectFrom || this.returnUrl;
  }

  protected async firstUpdated(_changedProperties: any) {
    super.firstUpdated(_changedProperties);

    const self = this;

    if (oktaSignIn.hasTokensInUrl()) {
      oktaSignIn.authClient.token.parseFromUrl().then(
        // If we get here, the user just logged in.
        function success(res: any) {
          const accessToken = res.tokens.accessToken;
          const idToken = res.tokens.idToken;

          oktaSignIn.authClient.tokenManager.add('accessToken', accessToken);
          oktaSignIn.authClient.tokenManager.add('idToken', idToken);

          // TODO: find a way to preserve the return URL

          self.onSuccess({
            token: accessToken,
            error: false,
            errorMessage: '',
            errorTitle: ''
          });
        },
        function error(err: any) {
          console.warn(`oktaSignIn.authClient.token.parseFromUrl() errored: ${err}`);
        }
      );
    } else {
      const user = await getUserInfo();
      if (user) {
        this.onSuccess({
          token: oktaSignIn.authClient.tokenManager.get('accessToken'),
          error: false,
          errorTitle: '',
          errorMessage: ''
        })
      } else {
        oktaSignIn.renderEl(
          { el: '#okta-login-container' },
          function success(res: any) {
            console.log(`oktaSignIn.renderEl() succeeded: ${res}`);
          },
          function error(err: any) {
            console.warn(`oktaSignIn.renderEl() errored: ${err}`);
          }
        );
      }
    }
  }
}
