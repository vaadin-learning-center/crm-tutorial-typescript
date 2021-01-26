import type { MiddlewareContext, MiddlewareNext } from '@vaadin/flow-frontend';
import { oktaSignIn } from '../auth';

// TODO: what to do when the backend requires an access token, but none is available?
// TODO: what to do when the backend rejects the provided access token?
export async function addAuthHeaderMiddleware(context: MiddlewareContext, next: MiddlewareNext) {
  const token = await oktaSignIn.authClient.tokenManager.get('accessToken');
  if (token && token.expiresAt > new Date().getTime() / 1000) {
    context.request.headers.set('Authorization', `Bearer ${token.accessToken}`);
  }
  return next(context);
}
