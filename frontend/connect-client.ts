import {ConnectClient, InvalidSessionMiddleware} from '@vaadin/flow-frontend';
const client = new ConnectClient({prefix: 'connect', middlewares: [new InvalidSessionMiddleware(
    async () => {
        const {LoginView} = await import ('./components/login-view/login-view');
        return new LoginView().showOverlay();
    }
)]});
export default client;
