import { css, customElement, html, LitElement } from 'lit-element';
import '@vaadin/vaadin-lumo-styles/all-imports';
import '@vaadin/vaadin-app-layout/theme/lumo/vaadin-app-layout';
import '@vaadin/vaadin-app-layout/theme/lumo/vaadin-drawer-toggle';

@customElement('main-layout')
export class MainLayout extends LitElement {
  static styles = css`
    .header {
      padding: 0 var(--lumo-space-m);
      display: flex !important;
      width: 100%;
      align-items: center;
    }

    .header h1.logo {
      font-size: 1em;
      margin: var(--lumo-space-m);
      flex: 1;
    }

    .drawer ul {
      list-style-type: none;
    }
    .drawer ul li {
      margin-bottom: var(--lumo-space-m);
    }
  `;

  render() {
    return html`
      <vaadin-app-layout id="layout">
        <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
        <div slot="navbar" class="header">
          <h1 class="logo">Vaadin CRM</h1>
          <vaadin-button @click="${this.discardCurrentSession}">Discard current session</vaadin-button>
          <a href="/logout" router-ignore>Log out</a>
        </div>
        <div slot="drawer" class="drawer">
          <ul>
            <li><a href="/">List</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>
        <slot></slot>
      </vaadin-app-layout>
    `;
  }

  private discardCurrentSession() {
    fetch('/logout', {method: 'POST'});
  }
}
