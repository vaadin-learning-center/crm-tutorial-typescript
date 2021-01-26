import { Commands, Context, Router } from '@vaadin/router';

import './components/main-layout/main-layout';
import './components/list-view/list-view';
import { handleAuthCallback, isLoggedIn, logout } from './auth';

import './utils/lumo';
import client from './generated/connect-client.default';
import { invalidSessionMiddleware } from './utils/invalid-session-middleware';
import { addAuthHeaderMiddleware } from './utils/add-auth-header-middleware';

// Show a login dialog in a popup when the user session expires
client.middlewares.push(
  invalidSessionMiddleware,
  addAuthHeaderMiddleware
);

const routes = [
  {
    path: '/login',
    component: 'login-view',
    action: async () => {
      await import (/* webpackChunkName: "login" */ './components/login-view/login-view');
    },
  },
  {
    path: '/callback',
    action: async (_: Context, commands: Commands) => {
      if (await handleAuthCallback()) {
        return commands.redirect(
          sessionStorage.getItem('login-redirect-path') || '/'
        );
      } else {
        return commands.redirect('/login?error');
      }
    },
  },

  // First log out on the client-side, when destroy the server-side security context.
  // Server-side logging out is handled by Spring Security: it handles HTTP GET requests to
  // /logout and redirects to /login?logout in response.
   {
     path: '/logout',
     action: async (_: Context, commands: Commands) => {
       await logout();
       return commands.redirect('/');
     }
   },
  {
    path: '/',
    action: async (context: Context, commands: Commands) => {
      if (!(await isLoggedIn())) {
        // Save requested path
        sessionStorage.setItem('login-redirect-path', context.pathname);
        return commands.redirect('/login');
      }
      return undefined;
    },
    component: 'main-layout',
    children: [
      {
        path: '/',
        component: 'list-view',
      },
      {
        path: '/dashboard',
        component: 'dashboard-view',
        action: () => {
          import(
            /* webpackChunkName: "dashboard" */ './components/dashboard-view/dashboard-view'
          );
        },
      },
    ],
  },
];

// Vaadin router needs an outlet in the index.html page to display views
const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);
