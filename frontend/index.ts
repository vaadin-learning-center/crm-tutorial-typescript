import { Commands, Context, Router } from '@vaadin/router';

import './components/main-layout/main-layout';
import './components/list-view/list-view';
import { rootStore } from './stores';

import './utils/lumo';
import client from './generated/connect-client.default';
import { invalidSessionMiddleware } from './utils/invalid-session-middleware';

// Show a login dialog in a popup when the user session expires
client.middlewares.push(invalidSessionMiddleware);

const routes = [
  {
    path: '/login',
    component: 'login-view',
    action: async () => {
      await import (/* webpackChunkName: "login" */ './components/login-view/login-view');
    },
  },
  // Logging out is handled by Spring Security: it handles HTTP GET requests to
  // /logout and redirects to /login?logout in response.
  // For that a "Logout" button should be an regular <a> tag (see main-layout.ts):
  //    `<a href="/logout" router-ignore>Log out</a>`
  //
  // In order to implement logging out on the client-side (e.g. in order to avoid
  // a full page reload), it would require a `/logout` route like the one below.
  // In that case a "Logout" button should an in-app link like
  //    `<a href="/logout">Log out</a>`
   {
     path: '/logout',
     action: async (_: Context, commands: Commands) => {
       await rootStore.auth.logout();
       return commands.redirect('/');
     }
   },
  {
    path: '/',
    action: async (_: Router.Context, commands: Router.Commands) => {
      if (!rootStore.auth.isLoggedIn) {
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
        path: '/companies',
        component: 'companies-view',
        action: () => {
          import(
            /* webpackChunkName: "companies" */ './components/companies-view/companies-view'
            );
        },
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
