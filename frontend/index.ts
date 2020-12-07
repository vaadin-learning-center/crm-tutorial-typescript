import { Commands, Context, Router } from '@vaadin/router';

import './components/main-layout/main-layout';
import './components/list-view/list-view';
import { logout } from '@vaadin/flow-frontend';

import './utils/lumo';

const isUserLoggedIn = function() {
  return localStorage.getItem('loggedIn') === 'true';
}

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
       await logout();
       localStorage.setItem('loggedIn', String(false));
       return commands.redirect('/');
     }
   },
  {
    path: '/',
    action: async (_: Router.Context, commands: Router.Commands) => {
      if (!isUserLoggedIn()) {
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
