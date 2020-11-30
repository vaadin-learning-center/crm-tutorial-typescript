import {ConnectClient, InvalidSessionMiddleware} from '@vaadin/flow-frontend';
import {rootStore} from './stores';
const client = new ConnectClient({prefix: 'connect', middlewares: [new InvalidSessionMiddleware(
    async () => {
      rootStore.auth.setSessionExpired();
      const {LoginView} = await import ('./components/login-view/login-view');
      return LoginView.showOverlay();
    }
)]});
export default client;
