import { Router } from '@vaadin/router';

import '@vaadin/vaadin-lumo-styles/all-imports';
import './src/main-layout';
import './src/views/list-view';

const routes = [
  {
    path: '/',
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
