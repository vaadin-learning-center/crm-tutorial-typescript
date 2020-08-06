import {ConnectClient, InvalidSessionMiddleWare, EndpointCallContinue} from '@vaadin/flow-frontend/Connect';
import { LoginView } from './components/login-view/login-view';
const client = new ConnectClient({prefix: 'connect', middlewares: [InvalidSessionMiddleWare.create(
    async (continueFunc: EndpointCallContinue)=>{
        await import ('./components/login-view/login-view');
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