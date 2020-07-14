import {MiddlewareContext, MiddlewareNext} from '@vaadin/flow-frontend/Connect';
import {LoginOverlay} from "./src/views/login-overlay";
import "./src/views/login-overlay";

// TODO: include this into `@vaadin/flow-frontend/Connect`
export async function reloginOnExpiredSession(context: MiddlewareContext, next: MiddlewareNext): Promise<Response> {
  const clonedContext = { ...context };
  clonedContext.request = context.request.clone();
  const response = await next(context);
  if (response.status === 401) {
    return new Promise(resolve => {
      const loginOverlay = document.createElement('login-overlay') as LoginOverlay;
      loginOverlay.addEventListener('login-success', (event) => {
        loginOverlay.remove();
        const token = (event as CustomEvent).detail.token as string;
        clonedContext.request.headers.set('X-CSRF-Token', token);
        resolve(next(clonedContext));
      });
      document.body.append(loginOverlay);
    });
  } else {
    return response;
  }
}