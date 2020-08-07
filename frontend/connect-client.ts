import {ConnectClient, InvalidSessionMiddleware} from '@vaadin/flow-frontend/Connect';
import { LoginView } from './src/views/login-view';
const client = new ConnectClient({prefix: 'connect', middlewares: [new InvalidSessionMiddleware(
    async (continueFunc) => {
        await import ('./src/views/login-view');
        const loginOverlay = new LoginView((result)=>{
            const token = result.token;
            if(token){
                continueFunc(token);
                loginOverlay.remove();
            }
        });
        document.body.append(loginOverlay);
    }
)]});
export default client;
