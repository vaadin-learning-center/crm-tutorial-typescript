import { InvalidSessionMiddleware } from '@vaadin/flow-frontend';
import { rootStore } from '../stores';

export const invalidSessionMiddleware = new InvalidSessionMiddleware(
  async () => {
    rootStore.auth.setSessionExpired();
    const { LoginView } = await import ('../components/login-view/login-view');
    return LoginView.openAsPopup();
  }
);
