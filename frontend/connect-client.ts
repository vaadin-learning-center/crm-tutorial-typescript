import {ConnectClient, InvalidSessionMiddleware, MiddlewareContext, MiddlewareNext} from '@vaadin/flow-frontend/Connect';
import { LoginView } from './src/views/login-view';
const myMiddleWareWithClass = new InvalidSessionMiddleware(
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
);

const myMiddleWareWithNativeFunction = (context: MiddlewareContext, next: MiddlewareNext)=>{
    Function
    return next(context);
};

const client = new ConnectClient({prefix: 'connect', middlewares: [myMiddleWareWithClass, myMiddleWareWithNativeFunction]});
export default client;