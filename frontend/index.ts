import { Router } from '@vaadin/router';

import '@vaadin/vaadin-lumo-styles/all-imports';
import './src/main-layout';
import './src/views/list-view';
import {isLoggedIn, logout} from "./src/auth";

const routes = [
  {
    path: '/login',
    component: 'login-view',
    action: async () => {
      await import (/* webpackChunkName: "login" */ './src/views/login-view');
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
     action: async (_: Router.Context, commands: Router.Commands) => {
       await logout();
       return commands.redirect('/');
     }
   },
  {
    path: '/',
    action: (_: Router.Context, commands: Router.Commands) => {
      if (!isLoggedIn()) {
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
            /* webpackChunkName: "dashboard" */ './src/views/dashboard-view'
          );
        },
      },
    ],
  },
];

// Vaadin router needs an outlet in the index.html page to display views
const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);
