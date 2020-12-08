import { InvalidSessionMiddleware } from '@vaadin/flow-frontend';

export const invalidSessionMiddleware = new InvalidSessionMiddleware(
  async () => {
    const { LoginView } = await import ('../components/login-view/login-view');
    return LoginView.openAsPopup();
  }
);
