import {ConnectClient, InvalidSessionMiddleware} from '@vaadin/flow-frontend';
import {setSessionExpired} from './auth';
const client = new ConnectClient({prefix: 'connect', middlewares: [new InvalidSessionMiddleware(
    async () => {
      setSessionExpired();
      const {LoginView} = await import ('./components/login-view/login-view');
      return LoginView.showOverlay();
    }
)]});
export default client;
