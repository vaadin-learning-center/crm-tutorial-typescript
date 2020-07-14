import {ConnectClient} from '@vaadin/flow-frontend/Connect';
import {reloginOnExpiredSession} from "./relogin-on-expired-session";
const client = new ConnectClient({prefix: 'connect', middlewares: [reloginOnExpiredSession]});
export default client;