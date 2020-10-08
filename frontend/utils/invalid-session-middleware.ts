import {InvalidSessionMiddleware} from '@vaadin/flow-frontend/Connect';

import {LoginView} from "../components/login-view/login-view";

export const invalidSessionMiddleware = new InvalidSessionMiddleware(
  async (continueFunc) => {
    await import('../components/login-view/login-view');
    const loginOverlay = new LoginView((result) => {
      const token = result.token;
      if (token) {
        continueFunc(token);
        loginOverlay.remove();
      }
    });
    document.body.append(loginOverlay);
  }
);
