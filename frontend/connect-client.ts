import {ConnectClient} from '@vaadin/flow-frontend/Connect';
import {reloginOnExpiredSession} from "./utils/relogin-on-expired-session";
const client = new ConnectClient({prefix: 'connect', middlewares: [reloginOnExpiredSession]});
export default client;