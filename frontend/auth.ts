import { logout as logoutImpl } from '@vaadin/flow-frontend';
import type { LoginResult } from '@vaadin/flow-frontend';
import { AccessToken, OktaAuth } from '@okta/okta-auth-js';
import * as Jwt4FlowEndpoint from './generated/Jwt4FlowEndpoint';

// In the Okta admin panel set the following:
//  - Application type: Single Page App (SPA)
//  - Allowed grant types: Authorization Code
//  - Login redirect URIs: http://localhost:8080/login
const authClient = new OktaAuth({
  issuer: 'https://dev-692531.okta.com/oauth2/default', // use your own
  clientId: '0oa1zku3mqYvm7pOt4x7', // use your own
  redirectUri: 'http://localhost:8080/callback',
  pkce: true,
});

export async function login(username: string, password: string) {
  const result: LoginResult = {
    error: false
  };

  try {
    const transaction = await authClient.signIn({
      username,
      password,
    });
    if (transaction.status === 'SUCCESS') {
      authClient.token.getWithRedirect({
        sessionToken: transaction.sessionToken,
        responseType: 'id_token',
      });
    }
  }
  catch (e) {
    result.error = true;
    result.errorTitle = 'Cannot login with Okta';
    result.errorMessage = `${e.errorSummary} (code ${e.errorCode})`;
  }

  return result;
}

export async function handleAuthCallback() {
  if (authClient.token.isLoginRedirect()) {
    try {
      const tokenResponse = await authClient.token.parseFromUrl();
      const { accessToken, idToken } = tokenResponse.tokens;
      if (!accessToken || !idToken) return false;

      authClient.tokenManager.add('accessToken', accessToken);
      authClient.tokenManager.add('idToken', idToken);

      await Jwt4FlowEndpoint.sync();

      return true;
    } catch (err) {
      console.warn(`authClient.token.parseFromUrl() errored: ${err}`);
      return false;
    }
  }
  return false;
}

export async function logout() {
  return Promise.all([
    authClient.signOut(),
    logoutImpl()
  ]);
}

export async function isLoggedIn() {
  // Checks if there is a current accessToken in the TokenManger.
  return !!(await getAccessToken());
}

export async function getAccessToken() {
  const token = (await authClient.tokenManager.get(
    'accessToken'
  )) as AccessToken;

  return token;
}

export async function setSessionExpired() {
  return authClient.closeSession();
}
